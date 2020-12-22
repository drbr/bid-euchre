import { AnyEventObject } from 'xstate';
import { GameStateConfig } from '../../../frontend/src/gameLogic/euchreStateMachine/GameStateTypes';
import {
  mapGameConfigFromDatabase,
  mapGameStateFromDatabase,
  mapPositionRecordFromDatabase,
} from '../../../frontend/src/gameLogic/ModelMappers';
import {
  AllGameInfo,
  GameConfig,
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

export async function getGameConfig(props: {
  gameId: string;
}): Promise<GameConfig | null> {
  const snapshot = await firebaseDatabaseAdminClient
    .ref(`/games/${props.gameId}/gameConfig`)
    .once('value');
  return mapGameConfigFromDatabase(snapshot.val());
}

export async function getGameStateFullJson(props: {
  gameId: string;
}): Promise<GameStateConfig | null> {
  const snapshot = await firebaseDatabaseAdminClient
    .ref(`/games/${props.gameId}/gameStates/fullJson`)
    .once('value');
  return mapGameStateFromDatabase(snapshot.val());
}

export async function transactionallySetGameStateFullJson(props: {
  gameId: string;
  transactionUpdate: (current: string | null | undefined) => string | undefined;
}): Promise<void> {
  await transactionallySetNode<string>({
    path: `/games/${props.gameId}/gameStates/fullJson`,
    transactionUpdate: props.transactionUpdate,
  });
}

export async function setGameStatePublicJson(props: {
  gameId: string;
  publicStateJson: string;
}): Promise<void> {
  return await firebaseDatabaseAdminClient
    .ref(`/games/${props.gameId}/gameStates/publicJson`)
    .set(props.publicStateJson);
}

export async function setGameStatePrivateContextsJson(props: {
  gameId: string;
  privateContextsJsonByPlayerId: Record<string, string>;
}): Promise<void> {
  return await firebaseDatabaseAdminClient
    .ref(`/games/${props.gameId}/gameStates/privateContextsJson`)
    .set(props.privateContextsJsonByPlayerId);
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
