import * as functions from 'firebase-functions';
import { ID_COLLISION_ERROR } from './databaseHelpers/CrudHelpers';
import executeJoinGame from './entryPoints/executeJoinGame';
import executeNewGame from './entryPoints/executeNewGame';

export const newGame = functions.https.onCall(() => {
  return executeNewGame();
});

export const joinGame = functions.https.onCall((data) => {
  try {
    return executeJoinGame(data);
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
