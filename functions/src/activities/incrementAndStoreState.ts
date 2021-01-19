import * as _ from 'lodash';
import { SendGameEventRequest } from '../../../frontend/src/gameLogic/apiContract/cloudFunctions/SendGameEvent';
import { PlayerIdentities } from '../../../frontend/src/gameLogic/apiContract/database/DataModel';
import { GameStateMachine } from '../../../frontend/src/gameLogic/euchreStateMachine/GameStateMachine';
import {
  GameEvent,
  GameState,
} from '../../../frontend/src/gameLogic/euchreStateMachine/GameStateTypes';
import {
  getStateConfigFromJson,
  hydrateStateFromConfig,
  serializeState,
} from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';
import { transitionStateMachine } from '../../../frontend/src/gameLogic/stateMachineUtils/transitionStateMachine';
import { preparePublicAndPrivateStateForStorage } from '../backendStateMachineUtils/preparePublicAndPrivateStateForStorage';
import * as DAO from '../databaseHelpers/BackendDAO';
import { assertEventsAreInSync } from './assertEventsAreInSync';

/**
 * The Firebase database does not support asynchronous transaction updaters. Usually it would be a
 * bad idea to even try making the update asynchronously, but because this is a turn-based game, the
 * frequency of updates should be low enough to allow this to work without churn.
 *
 * So, we implement our own custom transaction, which reads the current state, asynchronously runs
 * the state machine to compute the new value, and then writes the new value, as long as the
 * original value did not change in the meantime.
 */
export async function incrementStateMachineAndTransactionallyStoreResult(
  request: SendGameEventRequest,
  playerIdentities: PlayerIdentities
): Promise<void> {
  const { gameId, event, existingEventCount: eventCountFromClient } = request;

  const currentState = await DAO.getGameStateFullJson({ gameId });
  if (!currentState) {
    throw new Error(`No game state found in database for game ID ${gameId}`);
  }

  const hydratedCurrentState = hydrateStateFromConfig(currentState);

  const originalEventCountFromDatabase =
    hydratedCurrentState.hydratedState.context.eventCount;
  assertEventsAreInSync(originalEventCountFromDatabase, eventCountFromClient, {
    throwIfNull: true,
  });

  const nextStates = await transitionStateMachine(
    GameStateMachine,
    hydratedCurrentState,
    event as GameEvent
  );
  const finalState = _.last(nextStates);
  if (!finalState) {
    throw new Error('Event did not result in a new game state!');
  }

  // Sometimes the transaction update will run multiple times, seemingly unnecessarily – the first
  // time, `current` will be undefined, and then the second time it'll be correct. We want to make
  // sure the event count is in sync, but if it's "wrong" the first time and okay the second time,
  // that's fine. So this variable helps keep track of that for error logging.
  let foundNullEventCountsOnLatestAttempt = false;

  await DAO.transactionallySetGameStateFullJson({
    gameId,
    transactionUpdate: (currentJson) => {
      // Now that we've asynchronously computed the new state, verify the event count to make sure
      // that the state from the database hasn't changed. If it has changed, there's no way we can
      // recover, so we throw an error immediately. If this is the first of possibly multiple
      // transaction attempts, the `current` might be null, but in that case, the transaction will
      // (probably) try again and the first iteration is ignored.
      const newEventCountFromDatabase = currentJson
        ? getStateConfigFromJson(currentJson).context.eventCount
        : null;
      foundNullEventCountsOnLatestAttempt = assertEventsAreInSync(
        originalEventCountFromDatabase,
        newEventCountFromDatabase,
        { throwIfNull: false }
      ).countsWereNull;

      return serializeState(finalState);
    },
  });

  await storePublicAndPrivateSnapshotsFromTransition({
    gameId,
    nextStates,
    playerIdentities,
  });

  // If we found null event counts but didn't try again and eventually succeed, _then_ something
  // is wrong and the error should be thrown.
  if (foundNullEventCountsOnLatestAttempt) {
    throw new Error(
      'Fetched null event counts during database transaction but did not recover!'
    );
  }
}

export async function storePublicAndPrivateSnapshotsFromTransition(params: {
  gameId: string;
  nextStates: ReadonlyArray<GameState>;
  playerIdentities: PlayerIdentities;
}): Promise<void> {
  const { gameId, nextStates, playerIdentities } = params;
  for (const snapshot of nextStates) {
    const {
      publicStateJson,
      privateStatesJsonByPlayerId,
    } = preparePublicAndPrivateStateForStorage(snapshot, playerIdentities);

    const eventCount = snapshot.context.eventCount;

    await Promise.all([
      DAO.setGameStatePublicJson({
        gameId: gameId,
        publicStateJson,
        eventCount,
      }),
      DAO.setGameStatePrivateJson({
        gameId: gameId,
        privateStatesJsonByPlayerId,
        eventCount,
      }),
    ]);
  }
}
