import { PublicGameConfig } from '../../../functions/apiContract/database/DataModel';
import {
  mapGameConfigFromDatabase,
  mapPrivateGameStateFromDatabase,
  mapGameMachineStateFromDatabase,
} from '../gameLogic/ModelMappers';
import {
  GameContext,
  GameState,
} from '../gameLogic/euchreStateMachine/GameStateTypes';
import { Subscription, UnsubscribeFn } from '../uiHelpers/useObservedState';
import { firebaseDatabase } from './FirebaseWebClientInFrontend';

export type GameIdParams = { gameId: string };

function subscribeToDatabaseNode<D, T>(
  path: string,
  mapper: (value: D | null | undefined) => T | null,
  callback: (data: T | null) => void
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
    mapGameConfigFromDatabase,
    callback
  );
};

export const subscribeToPublicGameMachineState: Subscription<
  GameIdParams,
  GameState
> = ({ gameId }, callback) => {
  return subscribeToDatabaseNode(
    `/gameMachineState/${gameId}/publicJson`,
    mapGameMachineStateFromDatabase,
    callback
  );
};

export const subscribeToPrivateGameState: Subscription<
  { gameId: string; playerId: string },
  Partial<GameContext>
> = ({ gameId, playerId }, callback) => {
  return subscribeToDatabaseNode(
    `/playerPrivateGameStateJson/${gameId}/${playerId}`,
    mapPrivateGameStateFromDatabase,
    callback
  );
};
