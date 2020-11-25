import {
  PlayerPrivateGameState,
  PublicGameConfig,
  PublicGameState,
} from '../../../functions/apiContract/database/DataModel';
import {
  mapGameConfigFromDatabase,
  mapPrivateGameStateFromDatabase,
  mapPublicGameStateFromDatabase,
} from '../gameLogic/ModelMappers';
import { firebaseDatabase } from './FirebaseWebClientInFrontend';

export type UnsubscribeFn = () => void;

export function subscribeToPublicGameConfig(
  gameId: string,
  callback: (gameConfig: PublicGameConfig | null) => void
): UnsubscribeFn {
  const ref = firebaseDatabase.ref(`/publicGameConfig/${gameId}`);
  const unsubscribeKey = ref.on('value', (snapshot) =>
    callback(mapGameConfigFromDatabase(snapshot.val()))
  );
  return () => ref.off('value', unsubscribeKey);
}

export function subscribeToPublicGameState(
  gameId: string,
  callback: (gameConfig: PublicGameState | null) => void
): UnsubscribeFn {
  const ref = firebaseDatabase.ref(`/publicGameState/${gameId}`);
  const unsubscribeKey = ref.on('value', (snapshot) =>
    callback(mapPublicGameStateFromDatabase(snapshot.val()))
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
    callback(mapPrivateGameStateFromDatabase(snapshot.val()))
  );
  return () => ref.off('value', unsubscribeKey);
}
