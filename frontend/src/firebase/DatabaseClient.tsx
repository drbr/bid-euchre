import { firebaseDatabase } from './FirebaseWebClientInFrontend';
import { GameDB } from '../../../functions/apiContract/database/GameDB';

export async function getGameValue(gameId: string): Promise<GameDB | null> {
  const snapshot = await firebaseDatabase.ref(`games/${gameId}`).get();
  return snapshot.val();
}
