import { v4 as uuidv4 } from 'uuid';
import { NewGameResult } from '../../apiContract/models/NewGame';

export default function executeNewGame(): NewGameResult {
  const gameId = uuidv4();
  console.log(`New game ID: ${gameId}`);
  // firebase.database.ref(`games/${gameId}`).set({
  //   pending: true,
  // });
  return { gameId };
}
