import { PublicGameConfig } from '../../../functions/apiContract/database/DataModel';
import { firebaseDatabase } from './FirebaseWebClientInFrontend';

export async function getPublicGameConfig(
  gameId: string
): Promise<PublicGameConfig | null> {
  const snapshot = await firebaseDatabase
    .ref(`publicGameConfig/${gameId}`)
    .get();
  return snapshot.val();
}
