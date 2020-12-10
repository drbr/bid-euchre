import { AnyEventObject } from 'xstate';
import {
  mapGameInfoFromDatabase,
  mapGameStatesFromDatabase,
  mapPositionRecordFromDatabase,
} from '../../../frontend/src/gameLogic/ModelMappers';
import {
  AllGameInfo,
  GameStates,
  GameStatus,
  PlayerIdentities,
} from '../../apiContract/database/DataModel';
import { Position } from '../../apiContract/database/GameState';
import { TypedDataSnapshot } from '../../apiContract/database/TypedDataSnapshot';
import { firebaseDatabaseAdminClient } from '../firebase/FirebaseAdminClientInBackend';
import {
  transactionallyCreateChildNode,
  transactionallySetNode,
} from './CrudHelpers';

export async function transactionallyCreateGameInfo(props: {
  value: AllGameInfo;
  generateGameId: () => string;
}): Promise<TypedDataSnapshot<AllGameInfo>> {
  return await transactionallyCreateChildNode({
    generatePath: () => `/games/${props.generateGameId()}`,
    value: props.value,
  });
}

export async function getGameInfo(props: {
  gameId: string;
}): Promise<AllGameInfo | null> {
  const snapshot = await firebaseDatabaseAdminClient
    .ref(`/games/${props.gameId}`)
    .once('value');
  return mapGameInfoFromDatabase(snapshot.val());
}

export async function setGameStatus(props: {
  gameId: string;
  gameStatus: GameStatus;
}): Promise<void> {
  return await firebaseDatabaseAdminClient
    .ref(`/games/${props.gameId}/gameConfig/gameStatus`)
    .set(props.gameStatus);
}

export async function setPlayerNameAtPosition(props: {
  gameId: string;
  friendlyName: string;
  position: Position;
}): Promise<void> {
  return await firebaseDatabaseAdminClient
    .ref(
      `/games/${props.gameId}/gameConfig/playerFriendlyNames/${props.position}`
    )
    .set(props.friendlyName);
}

export async function transactionallyAddPlayerIdentityToGameAtPosition(props: {
  gameId: string;
  playerId: string;
  position: Position;
}): Promise<TypedDataSnapshot<string>> {
  return await transactionallyCreateChildNode({
    generatePath: () =>
      `/games/${props.gameId}/playerIdentities/${props.position}`,
    value: props.playerId,
    tries: 1,
  });
}

export async function getPlayerIdentities(props: {
  gameId: string;
}): Promise<PlayerIdentities> {
  const snapshot = await firebaseDatabaseAdminClient
    .ref(`/games/${props.gameId}/playerIdentities/`)
    .once('value');
  return mapPositionRecordFromDatabase(snapshot.val());
}

export async function getGameStates(props: {
  gameId: string;
}): Promise<GameStates | null> {
  const snapshot = await firebaseDatabaseAdminClient
    .ref(`/games/${props.gameId}/gameStates`)
    .once('value');
  return mapGameStatesFromDatabase(snapshot.val());
}

export async function transactionallySetGameStates(props: {
  gameId: string;
  transactionUpdate: (
    current: GameStates | null | undefined
  ) => GameStates | undefined;
}): Promise<void> {
  await transactionallySetNode<GameStates>({
    path: `/games/${props.gameId}/gameStates`,
    transactionUpdate: props.transactionUpdate,
  });
}

export async function pushGameEvent(props: {
  gameId: string;
  event: AnyEventObject;
}): Promise<void> {
  const newRef = firebaseDatabaseAdminClient
    .ref(`/gameEvents/${props.gameId}`)
    .push();
  return await newRef.set(JSON.stringify(props.event));
}
