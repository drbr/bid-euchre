import { PublicGameConfig } from '../../../functions/apiContract/database/DataModel';
import { firebaseDatabase } from './FirebaseWebClientInFrontend';

export type UnsubscribeFn = () => void;

export async function getPublicGameConfig(
  gameId: string
): Promise<PublicGameConfig | null> {
  const snapshot = await firebaseDatabase
    .ref(`/publicGameConfig/${gameId}`)
    .get();
  return snapshot.val();
}

export function subscribeToPublicGameConfig(
  gameId: string,
  callback: (gameConfig: PublicGameConfig) => void
): UnsubscribeFn {
  const ref = firebaseDatabase.ref(`/publicGameConfig/${gameId}`);
  const unsubscribeKey = ref.on('value', (snapshot) =>
    callback(snapshot.val())
  );
  return () => ref.off('value', unsubscribeKey);
}
