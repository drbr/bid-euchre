import { NewGameResult } from '../../apiContract/cloudFunctions/NewGame';
import { generateFriendlyId } from '../databaseHelpers/generateId';
import { DatabaseNodes } from '../databaseHelpers/DatabaseNodes';

import {
  setNode,
  transactionallyCreateChildNode,
} from '../databaseHelpers/CrudHelpers';

export default async function executeNewGame(): Promise<NewGameResult> {
  const publicGameConfig = await transactionallyCreateChildNode({
    path: DatabaseNodes.publicGameConfig,
    value: { playerFriendlyNames: initialPlayers },
    generateKey: generateFriendlyId,
  });

  const gameId = publicGameConfig.key;
  if (!gameId) {
    throw new Error('Public game config was created, but ID is empty');
  }

  await setNode({
    path: DatabaseNodes.playerIdentitiesForGame(gameId),
    value: initialPlayers,
  });

  return { gameId };
}

const initialPlayers = {
  north: null,
  south: null,
  east: null,
  west: null,
};
