import * as functions from 'firebase-functions';
import {
  ID_COLLISION_ERROR,
  TRANSACTION_FAILED_ERROR,
} from './databaseHelpers/CrudHelpers';
import executeJoinGame from './entryPoints/executeJoinGame';
import executeNewGame from './entryPoints/executeNewGame';
import executeSendGameEvent, {
  INVALID_STATE_TRANSITION_ERROR,
  STALE_STATE_ERROR,
  USER_NOT_AUTHORIZED_ERROR,
} from './entryPoints/executeSendGameEvent';

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
    if (e instanceof USER_NOT_AUTHORIZED_ERROR) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'The player is not authorized to update this game.'
      );
    } else if (e instanceof STALE_STATE_ERROR) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Cannot apply update; the client and server state are not in sync.'
      );
    } else if (e instanceof INVALID_STATE_TRANSITION_ERROR) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Cannot apply update; the state machine did not accept the event.'
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
