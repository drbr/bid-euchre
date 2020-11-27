import { AnyEventObject } from 'xstate';
import {
  mapGameConfigFromDatabase,
  mapPositionRecordFromDatabase,
} from '../../../frontend/src/gameLogic/ModelMappers';
import { GameState } from '../../../frontend/src/gameLogic/stateMachine/GameStateTypes';
import {
  GameStatus,
  PlayerIdentities,
  PlayerPrivateGameStates,
  PublicGameConfig,
} from '../../apiContract/database/DataModel';
import { Position } from '../../apiContract/database/GameState';
import { TypedDataSnapshot } from '../../apiContract/database/TypedDataSnapshot';
import { firebaseDatabaseAdminClient } from '../firebase/FirebaseAdminClientInBackend';
import {
  serializeState,
  HydratedState,
  hydrateState,
} from '../../../frontend/src/gameLogic/StateMachineHelpers';
import {
  transactionallyCreateChildNode,
  transactionallySetNode,
} from './CrudHelpers';

export async function transactionallyCreatePublicGameConfig(props: {
  value: PublicGameConfig;
  generateKey: () => string;
}): Promise<TypedDataSnapshot<PublicGameConfig>> {
  return await transactionallyCreateChildNode({
    path: '/publicGameConfig',
    value: props.value,
    generateKey: props.generateKey,
  });
}

export async function getPublicGameConfig(props: {
  gameId: string;
}): Promise<PublicGameConfig | null> {
  const snapshot = await firebaseDatabaseAdminClient
    .ref(`/publicGameConfig/${props.gameId}`)
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
      `/publicGameConfig/${props.gameId}/playerFriendlyNames/${props.position}`
    )
    .set(props.friendlyName);
}

export async function setGameStatus(props: {
  gameId: string;
  gameStatus: GameStatus;
}): Promise<void> {
  return await firebaseDatabaseAdminClient
    .ref(`/publicGameConfig/${props.gameId}/gameStatus`)
    .set(props.gameStatus);
}

export async function transactionallyAddPlayerIdentityToGameAtPosition(props: {
  gameId: string;
  playerId: string;
  position: Position;
}): Promise<TypedDataSnapshot<string>> {
  return await transactionallyCreateChildNode({
    path: `/playerIdentities/${props.gameId}`,
    value: props.playerId,
    generateKey: () => props.position,
    tries: 1,
  });
}

export async function getPlayerIdentities(props: {
  gameId: string;
}): Promise<PlayerIdentities> {
  const snapshot = await firebaseDatabaseAdminClient
    .ref(`/playerIdentities/${props.gameId}`)
    .once('value');
  return mapPositionRecordFromDatabase(snapshot.val());
}

export async function transactionallySetGameMachineStateJson(props: {
  gameId: string;
  transactionUpdate: (
    current: HydratedState<GameState> | null
  ) => GameState | undefined;
}): Promise<void> {
  await transactionallySetNode<string>({
    path: `/gameMachineStateJson/${props.gameId}`,
    transactionUpdate: (currentJson) => {
      const current = currentJson ? hydrateState(currentJson) : null;
      const maybeNewState = props.transactionUpdate(current);
      return maybeNewState ? serializeState(maybeNewState) : undefined;
    },
  });
}

export async function pushGameEvent(props: {
  gameId: string;
  event: AnyEventObject;
}): Promise<void> {
  const newRef = firebaseDatabaseAdminClient
    .ref(`/gameEventsJson/${props.gameId}`)
    .push();
  return await newRef.set(JSON.stringify(props.event));
}

export async function setPlayerPrivateGameStates(props: {
  gameId: string;
  gameStates: PlayerPrivateGameStates;
}): Promise<void> {
  return await firebaseDatabaseAdminClient
    .ref(`/playerPrivateGameState/${props.gameId}`)
    .set(props.gameStates);
}
