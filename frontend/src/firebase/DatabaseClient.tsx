import { PublicGameConfig } from '../../../functions/apiContract/database/DataModel';
import { firebaseDatabase } from './FirebaseWebClientInFrontend';
import * as DatabaseNodes from './DatabaseNodes';

export async function getPublicGameConfig(
  gameId: string
): Promise<PublicGameConfig | null> {
  const snapshot = await firebaseDatabase
    .ref(DatabaseNodes.publicGameConfig(gameId))
    .get();
  return snapshot.val();
}
