import * as functions from 'firebase-functions';
import executeNewGame from './entryPoints/executeNewGame';

export const newGame = functions.https.onCall(() => {
  return executeNewGame();
});
