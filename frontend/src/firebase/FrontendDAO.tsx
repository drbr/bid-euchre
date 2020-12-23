import { GameConfig } from '../../../functions/apiContract/database/DataModel';
import { GameStateConfig } from '../gameLogic/euchreStateMachine/GameStateTypes';
import {
  mapGameConfigFromDatabase,
  mapGameStateFromDatabase,
} from '../gameLogic/ModelMappers';
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

export const subscribeToGameConfig: Subscription<GameIdParams, GameConfig> = (
  { gameId },
  callback
) => {
  return subscribeToDatabaseNode(
    `/games/${gameId}/gameConfig`,
    mapGameConfigFromDatabase,
    callback
  );
};

export const subscribeToPublicGameState: Subscription<
  GameIdParams,
  GameStateConfig
> = ({ gameId }, callback) => {
  return subscribeToDatabaseNode(
    `/games/${gameId}/gameStates/publicJson`,
    mapGameStateFromDatabase,
    callback
  );
};

export const subscribeToPrivateGameState: Subscription<
  { gameId: string; playerId: string },
  GameStateConfig
> = ({ gameId, playerId }, callback) => {
  return subscribeToDatabaseNode(
    `/games/${gameId}/gameStates/privateJson/${playerId}`,
    mapGameStateFromDatabase,
    callback
  );
};
