import {
  PlayerPrivateGameState,
  PublicGameConfig,
} from '../../../functions/apiContract/database/DataModel';
import {
  mapGameConfigFromDatabase,
  mapPrivateGameStateFromDatabase,
  mapGameMachineStateFromDatabase,
} from '../gameLogic/ModelMappers';
import { GameState } from '../gameLogic/stateMachine/GameStateTypes';
import { Subscription, UnsubscribeFn } from '../uiHelpers/useObservedState';
import { firebaseDatabase } from './FirebaseWebClientInFrontend';

export type GameIdParams = { gameId: string };

function subscribeToDatabaseNode<D, T>(
  path: string,
  callback: (data: T | null) => void,
  mapper: (value: D | null | undefined) => T | null
): UnsubscribeFn {
  const ref = firebaseDatabase.ref(path);
  const unsubscribeKey = ref.on('value', (snapshot) => {
    const mapped = mapper(snapshot.val());
    callback(mapped);
  });
  return () => ref.off('value', unsubscribeKey);
}

export const subscribeToEntireDatabase: Subscription<
  Record<string, unknown>,
  unknown
> = (_, callback) => {
  return subscribeToDatabaseNode(`/`, callback, (x) => x);
};

export const subscribeToPublicGameConfig: Subscription<
  GameIdParams,
  PublicGameConfig
> = ({ gameId }, callback) => {
  return subscribeToDatabaseNode(
    `/publicGameConfig/${gameId}`,
    callback,
    mapGameConfigFromDatabase
  );
};

export const subscribeToGameMachineState: Subscription<
  GameIdParams,
  GameState
> = ({ gameId }, callback) => {
  return subscribeToDatabaseNode(
    `/gameMachineStateJson/${gameId}`,
    callback,
    mapGameMachineStateFromDatabase
  );
};

export const subscribeToPrivateGameState: Subscription<
  { gameId: string; playerId: string },
  PlayerPrivateGameState
> = ({ gameId, playerId }, callback) => {
  return subscribeToDatabaseNode(
    `/playerPrivateGameState/${gameId}/${playerId}`,
    callback,
    mapPrivateGameStateFromDatabase
  );
};
