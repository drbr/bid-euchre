import { PublicGameConfig } from '../../../functions/apiContract/database/DataModel';
import { firebaseDatabase } from './FirebaseWebClientInFrontend';

export type UnsubscribeFn = () => void;

// export async function getPublicGameConfig(
//   gameId: string
// ): Promise<PublicGameConfig | null> {
//   const snapshot = await firebaseDatabase
//     .ref(`/publicGameConfig/${gameId}`)
//     .get();
//   return snapshot.val();
// }

export function subscribeToPublicGameConfig(
  gameId: string,
  callback: (gameConfig: PublicGameConfig | null) => void
): UnsubscribeFn {
  const ref = firebaseDatabase.ref(`/publicGameConfig/${gameId}`);
  const unsubscribeKey = ref.on('value', (snapshot) =>
    callback(mapGameConfig(snapshot.val()))
  );
  return () => ref.off('value', unsubscribeKey);
}

/**
 * The database returns null values as nonexistent keys. Map client-side to keys with undefined
 * values.
 */
function mapGameConfig(original: PublicGameConfig): PublicGameConfig {
  return {
    gameExists: original.gameExists,
    playerFriendlyNames: {
      north: original.playerFriendlyNames?.north,
      south: original.playerFriendlyNames?.south,
      east: original.playerFriendlyNames?.east,
      west: original.playerFriendlyNames?.west,
    },
  };
}
