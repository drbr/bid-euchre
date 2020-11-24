import {
  PublicGameConfig,
  PublicGameState,
} from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { firebaseDatabase } from './FirebaseWebClientInFrontend';

export type UnsubscribeFn = () => void;

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

export function subscribeToPublicGameState(
  gameId: string,
  callback: (gameConfig: PublicGameState | null) => void
): UnsubscribeFn {
  const ref = firebaseDatabase.ref(`/publicGameState/${gameId}`);
  const unsubscribeKey = ref.on('value', (snapshot) =>
    callback(mapGameState(snapshot.val()))
  );
  return () => ref.off('value', unsubscribeKey);
}

/**
 * The database returns null values as nonexistent keys. Deep-map client-side to keys with undefined
 * values.
 */
function mapGameConfig(
  original: PublicGameConfig | undefined
): PublicGameConfig | null {
  if (!original) {
    return null;
  }
  return {
    gameExists: original.gameExists,
    playerFriendlyNames: mapPositionRecord(original.playerFriendlyNames),
  };
}

/**
 * The database returns null values as nonexistent keys. Deep-map client-side to keys with undefined
 * values.
 */
function mapGameState(
  original: PublicGameState | undefined
): PublicGameState | null {
  if (!original) {
    return null;
  }
  return {
    score: original.score,
    currentDealer: original.currentDealer,
    bids: mapPositionRecord(original.bids),
    trump: original.trump,
    currentTrickLead: original.currentTrickLead,
    currentTrick: original.currentTrick
      ? mapPositionRecord(original.currentTrick)
      : undefined,
    wonTricks: original.wonTricks,
  };
}

function mapPositionRecord<T>(
  original: Record<Position, T | null> | null | undefined
): Record<Position, T | null> {
  if (!original) {
    return {
      north: null,
      south: null,
      east: null,
      west: null,
    };
  } else {
    return {
      north: original.north ?? null,
      south: original.south ?? null,
      east: original.east ?? null,
      west: original.west ?? null,
    };
  }
}
