import { v4 as uuidv4 } from 'uuid';
import { GameDB } from '../../apiContract/database/GameDB';
import { NewGameResult } from '../../apiContract/functions/NewGame';

import { firebaseDatabaseAdminClient } from '../firebase/FirebaseAdminClientInBackend';

export default async function executeNewGame(): Promise<NewGameResult> {
  const gameId = uuidv4();
  const gameValue = Math.floor(Math.random() * 10000);
  const data: GameDB = { randomValue: gameValue };

  await firebaseDatabaseAdminClient.ref(`games/${gameId}`).set(data);
  return { gameId };
}
