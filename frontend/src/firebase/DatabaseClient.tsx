import { firebaseDatabase } from './InitFirebaseInFrontend';

export async function getGameValue(gameId: string) {
  await firebaseDatabase.ref(`games/${gameId}`).get();
}
