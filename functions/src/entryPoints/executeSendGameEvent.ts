import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import { GAME_NOT_FOUND_ERROR, INVALID_GAME_STATUS_ERROR } from '..';
import {
  GameEvent,
  GameState,
} from '../../../frontend/src/gameLogic/euchreStateMachine/GameStateTypes';
import { sanitizeState } from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';
import { transitionStateMachineWithInterpreter } from '../../../frontend/src/gameLogic/stateMachineUtils/transitionStateMachine';
import { mapPositions } from '../../../frontend/src/gameLogic/utils/ModelHelpers';
import {
  SendGameEventRequest,
  SendGameEventResult,
} from '../../apiContract/cloudFunctions/SendGameEvent';
import * as DAO from '../databaseHelpers/BackendDAO';

/**
 * Thrown if the user is not in the game
 */
export class USER_NOT_AUTHORIZED_ERROR {}

/**
 * Thrown if the state has been updated since this event was sent.
 * This is determined by comparing the `existingEventCount` field from the request
 * against the `eventCount` field in the state.
 */
export class STALE_STATE_ERROR {}

/**
 * Thrown if the state machine does not accept the event.
 */
export class INVALID_STATE_TRANSITION_ERROR {}

export default async function executeSendGameEvent(
  request: SendGameEventRequest
): Promise<SendGameEventResult> {
  const { event, gameId, playerId } = request;

  // Make sure the game exists and is underway.
  const gameConfig = await DAO.getPublicGameConfig({ gameId });
  if (!gameConfig) {
    throw new GAME_NOT_FOUND_ERROR();
  }
  if (gameConfig.gameStatus !== 'inProgress') {
    throw new INVALID_GAME_STATUS_ERROR();
  }

  // Make sure that the player is participating in this game.
  const playerIdentities = await DAO.getPlayerIdentities({ gameId });
  const playerIds = mapPositions(playerIdentities, (pid) => pid);
  const playerIsPartOfThisGame = _.includes(playerIds, playerId);
  if (!playerIsPartOfThisGame) {
    throw new USER_NOT_AUTHORIZED_ERROR();
  }

  const nextState = await runStateMachineAndTransactionallyStoreResult(request);

  // Once the state is successfully updated, update the sanitized version of the state,
  // and push the event to the server's private record.
  await Promise.all([
    DAO.setPublicGameMachineStateJson({
      gameId,
      machineStateJson: sanitizeState(nextState),
    }),
    DAO.pushGameEvent({ gameId, event }),
  ]);
}

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
async function runStateMachineAndTransactionallyStoreResult(
  request: SendGameEventRequest
): Promise<GameState> {
  const { gameId, event, existingEventCount: eventCountFromClient } = request;

  const currentState = await DAO.getFullGameMachineStateJson({ gameId });
  if (!currentState) {
    throw new Error(`No game state found in database for game ID ${gameId}`);
  }
  const eventCountFromDatabase =
    currentState && currentState.hydratedState.context.eventCount;
  assertEventsAreInSync(eventCountFromDatabase, eventCountFromClient, {
    throwIfNull: true,
  });

  let nextState = currentState.hydratedState;
  try {
    nextState = await transitionStateMachineWithInterpreter(
      currentState,
      event as GameEvent
    );
  } catch (e) {
    // The state machine runs in Strict Mode, so an event not enumerated in the state machine should
    // get caught here.
    functions.logger.error(e);
    throw new INVALID_STATE_TRANSITION_ERROR();
  }

  // Sometimes the transaction update will run multiple times, apparently unnecessarily – the first
  // time, `current` will be undefined, and then the second time it'll be correct. We want to make
  // sure the event count is in sync, but if it's "wrong" the first time and okay the second time,
  // that's fine. So this variable helps keep track of that for error logging.
  let foundNullEventCountsOnLatestAttempt = false;

  await DAO.transactionallySetFullGameMachineStateJson({
    gameId,
    transactionUpdate: (current) => {
      // Now that we've asynchronously computed the new state, make sure that the state from the
      // database hasn't changed by verifying the event count. If it has changed, there's no way we
      // can recover, so we throw an error immediately. If this is the first of possibly multiple
      // transaction attempts, the `current` might be null, but in that case, the transaction will
      // probably try again and the first iteration is ignored.
      const newEventCountFromDatabase =
        current && current.hydratedState.context.eventCount;
      foundNullEventCountsOnLatestAttempt = assertEventsAreInSync(
        eventCountFromDatabase,
        newEventCountFromDatabase,
        { throwIfNull: false }
      ).countsWereNull;

      return nextState;
    },
  });

  // If we found null event counts but didn't try again and eventually succeed, _then_ throw the
  // error.
  if (foundNullEventCountsOnLatestAttempt) {
    throw new Error(
      'Fetched null event counts during database transaction but did not recover!'
    );
  }

  return nextState;
}
