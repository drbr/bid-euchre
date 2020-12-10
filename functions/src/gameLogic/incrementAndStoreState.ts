import * as functions from 'firebase-functions';
import {
  GameEvent,
  GameState,
} from '../../../frontend/src/gameLogic/euchreStateMachine/GameStateTypes';
import {
  getStateConfigFromJson,
  hydrateStateFromJson,
  serializeState,
} from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';
import { transitionStateMachine } from '../../../frontend/src/gameLogic/stateMachineUtils/transitionStateMachine';
import { SendGameEventRequest } from '../../apiContract/cloudFunctions/SendGameEvent';
import { AllGameInfo } from '../../apiContract/database/DataModel';
import * as DAO from '../databaseHelpers/BackendDAO';
import {
  INVALID_STATE_TRANSITION_ERROR,
  STALE_STATE_ERROR,
} from '../entryPoints/executeSendGameEvent';
import { preparePublicAndPrivateStateForStorage } from './preparePublicAndPrivateStateForStorage';

/**
 * Before applying the event, verify that the current state is in sync
 * between the client and the server, by checking that they both have
 * the same event count. Since we transactionally update the event count
 * and the client never touches the state directly, the two event counts
 * being equal should be sufficient to know that the two states are equal.
 *
 * @returns a boolean indicating whether some encountered counts were null.
 */
function assertEventsAreInSync(
  eventCountA: number | null,
  eventCountB: number | null,
  options: { throwIfNull: boolean }
): { countsWereNull: boolean } {
  const { throwIfNull } = options;

  if (eventCountA === null || eventCountB === null) {
    if (throwIfNull) {
      throw new Error(
        'Event counts in existing states are null, this should never happen!'
      );
    } else {
      return { countsWereNull: true };
    }
  }

  if (eventCountA !== eventCountB) {
    functions.logger.error('Stale state: event count mismatch');
    throw new STALE_STATE_ERROR();
  }

  return { countsWereNull: false };
}

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
  gameInfo: AllGameInfo
): Promise<GameState> {
  const { gameId, event, existingEventCount: eventCountFromClient } = request;

  const currentStates = await DAO.getGameStates({ gameId });
  if (!currentStates) {
    throw new Error(`No game state found in database for game ID ${gameId}`);
  }

  const hydratedCurrentState = hydrateStateFromJson(currentStates.fullJson);

  const eventCountFromDatabase =
    hydratedCurrentState.hydratedState.context.eventCount;
  assertEventsAreInSync(eventCountFromDatabase, eventCountFromClient, {
    throwIfNull: true,
  });

  let nextState = hydratedCurrentState.hydratedState;
  try {
    nextState = await transitionStateMachine(
      hydratedCurrentState,
      event as GameEvent
    );
  } catch (e) {
    // The state machine runs in Strict Mode, so an event not enumerated in the state machine should
    // get caught here.
    functions.logger.error(e);
    throw new INVALID_STATE_TRANSITION_ERROR();
  }

  // Sometimes the transaction update will run multiple times, seemingly unnecessarily – the first
  // time, `current` will be undefined, and then the second time it'll be correct. We want to make
  // sure the event count is in sync, but if it's "wrong" the first time and okay the second time,
  // that's fine. So this variable helps keep track of that for error logging.
  let foundNullEventCountsOnLatestAttempt = false;

  await DAO.transactionallySetGameStates({
    gameId,
    transactionUpdate: (current) => {
      // Now that we've asynchronously computed the new state, verify the event count to make sure
      // that the state from the database hasn't changed. If it has changed, there's no way we can
      // recover, so we throw an error immediately. If this is the first of possibly multiple
      // transaction attempts, the `current` might be null, but in that case, the transaction will
      // probably try again and the first iteration is ignored.
      const newEventCountFromDatabase = current
        ? getStateConfigFromJson(current.fullJson).context.eventCount
        : null;
      foundNullEventCountsOnLatestAttempt = assertEventsAreInSync(
        eventCountFromDatabase,
        newEventCountFromDatabase,
        { throwIfNull: false }
      ).countsWereNull;

      const {
        publicStateJson,
        privateContextsJsonByPlayerId,
      } = preparePublicAndPrivateStateForStorage(
        nextState,
        gameInfo.playerIdentities
      );

      return {
        fullJson: serializeState(nextState),
        publicJson: publicStateJson,
        privateContextsJson: privateContextsJsonByPlayerId,
      };
    },
  });

  // If we found null event counts but didn't try again and eventually succeed, _then_ something
  // is wrong and the error should be thrown.
  if (foundNullEventCountsOnLatestAttempt) {
    throw new Error(
      'Fetched null event counts during database transaction but did not recover!'
    );
  }

  return nextState;
}
