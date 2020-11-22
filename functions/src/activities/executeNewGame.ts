import { v4 as uuidv4 } from 'uuid';
import { NewGameResult } from '../../apiContract/models/NewGame';

import { firebaseDatabase } from '../firebase/InitFirebaseInBackend';

export default async function executeNewGame(): Promise<NewGameResult> {
  const gameId = uuidv4();
  const gameValue = Math.floor(Math.random() * 10000);
  await firebaseDatabase.ref(`games/${gameId}`).set({
    randomValue: gameValue,
  });
  return { gameId };
}
