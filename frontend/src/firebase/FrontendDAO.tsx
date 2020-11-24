import {
  PlayerPrivateGameState,
  PublicGameConfig,
  PublicGameState,
} from '../../../functions/apiContract/database/DataModel';
import {
  mapGameConfig,
  mapPrivateGameState,
  mapPublicGameState,
} from '../gameLogic/ModelMappers';
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
    callback(mapPublicGameState(snapshot.val()))
  );
  return () => ref.off('value', unsubscribeKey);
}

export function subscribeToPrivateGameState(
  params: { gameId: string; playerId: string },
  callback: (gameConfig: PlayerPrivateGameState | null) => void
): UnsubscribeFn {
  const ref = firebaseDatabase.ref(
    `/playerPrivateGameState/${params.gameId}/${params.playerId}`
  );
  const unsubscribeKey = ref.on('value', (snapshot) =>
    callback(mapPrivateGameState(snapshot.val()))
  );
  return () => ref.off('value', unsubscribeKey);
}
