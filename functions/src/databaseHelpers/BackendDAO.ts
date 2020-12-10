import { AnyEventObject } from 'xstate';
import {
  mapGameConfigFromDatabase,
  mapPositionRecordFromDatabase,
} from '../../../frontend/src/gameLogic/ModelMappers';
import { GameState } from '../../../frontend/src/gameLogic/euchreStateMachine/GameStateTypes';
import {
  GameStatus,
  PlayerIdentities,
  PrivateGameContextsJson,
  GameConfig,
} from '../../apiContract/database/DataModel';
import { Position } from '../../apiContract/database/GameState';
import { TypedDataSnapshot } from '../../apiContract/database/TypedDataSnapshot';
import { firebaseDatabaseAdminClient } from '../firebase/FirebaseAdminClientInBackend';
import {
  serializeState,
  hydrateState,
  HydratedGameState,
} from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';
import {
  transactionallyCreateChildNode,
  transactionallySetNode,
} from './CrudHelpers';

export async function transactionallyCreateGameConfig(props: {
  value: GameConfig;
  generateKey: () => string;
}): Promise<TypedDataSnapshot<GameConfig>> {
  return await transactionallyCreateChildNode({
    generatePath: () => `/games/${props.generateKey()}/gameConfig`,
    value: props.value,
  });
}

export async function getGameConfig(props: {
  gameId: string;
}): Promise<GameConfig | null> {
  const snapshot = await firebaseDatabaseAdminClient
    .ref(`/games/${props.gameId}/gameConfig`)
    .once('value');
  return mapGameConfigFromDatabase(snapshot.val());
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

export async function setGameStatus(props: {
  gameId: string;
  gameStatus: GameStatus;
}): Promise<void> {
  return await firebaseDatabaseAdminClient
    .ref(`/games/${props.gameId}/gameConfig/gameStatus`)
    .set(props.gameStatus);
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

export async function getFullGameStateJson(props: {
  gameId: string;
}): Promise<HydratedGameState | null> {
  const snapshot = await firebaseDatabaseAdminClient
    .ref(`/games/${props.gameId}/gameState/fullJson`)
    .once('value');
  const json = snapshot.val();
  return json ? hydrateState(json) : null;
}

export async function transactionallySetFullGameStateJson(props: {
  gameId: string;
  transactionUpdate: (
    current: HydratedGameState | null
  ) => GameState | undefined;
}): Promise<void> {
  await transactionallySetNode<string>({
    path: `/games/${props.gameId}/gameState/fullJson`,
    transactionUpdate: (currentJson) => {
      const current = currentJson ? hydrateState(currentJson) : null;
      const maybeNewState = props.transactionUpdate(current);
      return maybeNewState ? serializeState(maybeNewState) : undefined;
    },
  });
}

export async function setPublicGameStateJson(props: {
  gameId: string;
  machineStateJson: string;
}): Promise<void> {
  return await firebaseDatabaseAdminClient
    .ref(`/games/${props.gameId}/gameState/publicJson`)
    .set(props.machineStateJson);
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

export async function setPrivateGameContextsJson(props: {
  gameId: string;
  gameStates: PrivateGameContextsJson;
}): Promise<void> {
  return await firebaseDatabaseAdminClient
    .ref(`/games/${props.gameId}/gameState/privateContextsJson`)
    .set(props.gameStates);
}
