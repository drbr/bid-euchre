import { PublicGameConfig } from '../../apiContract/database/DataModel';
import { Position } from '../../apiContract/database/GameState';
import { TypedDataSnapshot } from '../../apiContract/database/TypedDataSnapshot';
import { firebaseDatabaseAdminClient } from '../firebase/FirebaseAdminClientInBackend';
import { transactionallyCreateChildNode } from './CrudHelpers';

export async function createPublicGameConfig(props: {
  value: PublicGameConfig;
  generateKey: () => string;
}): Promise<TypedDataSnapshot<PublicGameConfig>> {
  return await transactionallyCreateChildNode({
    path: '/publicGameConfig',
    value: props.value,
    generateKey: props.generateKey,
  });
}

export async function addPlayerIdToGameAtPosition(props: {
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
