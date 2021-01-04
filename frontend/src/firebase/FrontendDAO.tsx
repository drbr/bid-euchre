import firebase from 'firebase/app';
import { GameConfig } from '../gameLogic/apiContract/database/DataModel';
import { GameStateConfig } from '../gameLogic/euchreStateMachine/GameStateTypes';
import {
  mapGameConfigFromDatabase,
  mapGameStateFromDatabase,
} from '../gameLogic/apiContract/database/ModelMappers';
import { Subscription, UnsubscribeFn } from '../uiHelpers/useSubscription';
import { firebaseDatabase } from './FirebaseWebClientInFrontend';

export type GameIdParams = { gameId: string };

function subscribeToDatabaseNode<D, T>(
  path: string,
  mapper: (value: D | null | undefined) => T | null,
  callback: (data: T | null) => void,
  event: firebase.database.EventType = 'value'
): UnsubscribeFn {
  const ref = firebaseDatabase.ref(path);
  const unsubscribeKey = ref.on(event, (snapshot) => {
    const mapped = mapper(snapshot.val());
    callback(mapped);
  });
  return () => ref.off(event, unsubscribeKey);
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
    callback,
    'child_added'
  );
};

export const subscribeToPrivateGameState: Subscription<
  { gameId: string; playerId: string },
  GameStateConfig
> = ({ gameId, playerId }, callback) => {
  return subscribeToDatabaseNode(
    `/games/${gameId}/gameStates/privateJson/${playerId}`,
    mapGameStateFromDatabase,
    callback,
    'child_added'
  );
};
