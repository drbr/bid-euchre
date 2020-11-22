import { firebaseDatabase } from './InitFirebaseInFrontend';
import { GameDB } from '../../../functions/apiContract/database/GameDB';

export async function getGameValue(gameId: string): Promise<GameDB> {
  const snapshot = await firebaseDatabase.ref(`games/${gameId}`).get();
  return snapshot.val();
}
