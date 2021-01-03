import * as functions from 'firebase-functions';
import { INVALID_STATE_TRANSITION_ERROR } from '../../frontend/src/gameLogic/stateMachineUtils/transitionStateMachine';
import {
  ID_COLLISION_ERROR,
  TRANSACTION_FAILED_ERROR,
} from './databaseHelpers/CrudHelpers';
import executeJoinGame from './activities/executeJoinGame';
import executeNewGame from './activities/executeNewGame';
import executeSendGameEvent, {
  STALE_STATE_ERROR,
  USER_NOT_AUTHORIZED_ERROR,
} from './activities/executeSendGameEvent';
import { SendGameEventErrorDetail } from '../../frontend/src/gameLogic/apiContract/cloudFunctions/SendGameEvent';

/** Thrown when the game with the given ID does not exist */
export class GAME_NOT_FOUND_ERROR {}

/**
 * Thrown when the game status (from the game config) is not the correct value to accept the
 * attempted action. For example, if a user tries to join a game that has already started.
 */
export class INVALID_GAME_STATUS_ERROR {}

export const newGame = functions.https.onCall(async () => {
  return await executeNewGame();
});

export const joinGame = functions.https.onCall(async (data) => {
  try {
    return await executeJoinGame(data);
  } catch (e) {
    if (e instanceof ID_COLLISION_ERROR) {
      throw new functions.https.HttpsError(
        'already-exists',
        'A player has already joined the game at that position.'
      );
    } else if (e instanceof GAME_NOT_FOUND_ERROR) {
      throw new functions.https.HttpsError(
        'not-found',
        'A game with the given ID has not been created.'
      );
    } else if (e instanceof INVALID_GAME_STATUS_ERROR) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The game with the given ID has already been started; players can no longer join.'
      );
    } else {
      throw e;
    }
  }
});

export const sendGameEvent = functions.https.onCall(async (data) => {
  try {
    return await executeSendGameEvent(data);
  } catch (e) {
    functions.logger.debug(
      'Caught exception in HTTPS error handler for SendGameEvent'
    );
    if (e instanceof GAME_NOT_FOUND_ERROR) {
      throw new functions.https.HttpsError(
        'not-found',
        'A game with the given ID has not been created.'
      );
    } else if (e instanceof INVALID_GAME_STATUS_ERROR) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The game with the given ID has not started yet.'
      );
    } else if (e instanceof USER_NOT_AUTHORIZED_ERROR) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'The player is not authorized to update this game.'
      );
    } else if (e instanceof STALE_STATE_ERROR) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Cannot apply update; the client and server state are not in sync.',
        SendGameEventErrorDetail.StaleState
      );
    } else if (e instanceof INVALID_STATE_TRANSITION_ERROR) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Cannot apply update; the state machine did not accept the event.',
        SendGameEventErrorDetail.InvalidStateTransition
      );
    } else if (e instanceof TRANSACTION_FAILED_ERROR) {
      throw new functions.https.HttpsError(
        'internal',
        'Cannot apply update; error writing to database.'
      );
    } else {
      throw e;
    }
  }
});
