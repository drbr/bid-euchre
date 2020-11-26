import {
  PlayerPrivateGameState,
  PublicGameConfig,
  PublicGameState,
} from '../../../functions/apiContract/database/DataModel';
import {
  mapGameConfigFromDatabase,
  mapPrivateGameStateFromDatabase,
  mapPublicGameStateFromDatabase,
  mapPublicGameStateJsonFromDatabase,
} from '../gameLogic/ModelMappers';
import { GameState } from '../gameLogic/stateMachine/GameStateTypes';
import { Subscription, UnsubscribeFn } from '../uiHelpers/useObservedState';
import { firebaseDatabase } from './FirebaseWebClientInFrontend';

export type GameIdParams = { gameId: string };

function subscribeToDatabase<D, T>(
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

export const subscribeToPublicGameConfig: Subscription<
  GameIdParams,
  PublicGameConfig
> = ({ gameId }, callback) => {
  return subscribeToDatabase(
    `/publicGameConfig/${gameId}`,
    callback,
    mapGameConfigFromDatabase
  );
};

export const subscribeToPublicGameState: Subscription<
  GameIdParams,
  PublicGameState
> = ({ gameId }, callback) => {
  return subscribeToDatabase(
    `/publicGameState/${gameId}`,
    callback,
    mapPublicGameStateFromDatabase
  );
};

export const subscribeToPublicGameStateJson: Subscription<
  GameIdParams,
  GameState
> = ({ gameId }, callback) => {
  return subscribeToDatabase(
    `/publicGameStateJson/${gameId}`,
    callback,
    mapPublicGameStateJsonFromDatabase
  );
};

export const subscribeToPrivateGameState: Subscription<
  { gameId: string; playerId: string },
  PlayerPrivateGameState
> = ({ gameId, playerId }, callback) => {
  return subscribeToDatabase(
    `/playerPrivateGameState/${gameId}/${playerId}`,
    callback,
    mapPrivateGameStateFromDatabase
  );
};
