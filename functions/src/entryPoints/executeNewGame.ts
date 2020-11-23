import { NewGameResult } from '../../apiContract/cloudFunctions/NewGame';
import { generateFriendlyId } from '../databaseHelpers/generateId';
import { DatabaseNodes } from '../databaseHelpers/DatabaseNodes';

import { transactionallyCreateChildNode } from '../databaseHelpers/CrudHelpers';
import { PublicGameConfig } from '../../apiContract/database/DataModel';

export default async function executeNewGame(): Promise<NewGameResult> {
  const publicGameConfig = await transactionallyCreateChildNode({
    path: DatabaseNodes.publicGameConfig,
    value: InitialGameConfig,
    generateKey: generateFriendlyId,
  });

  const gameId = publicGameConfig.key;
  if (!gameId) {
    throw new Error('Public game config was created, but ID is empty');
  }

  return { gameId };
}

const InitialGameConfig: PublicGameConfig = {
  gameExists: true,
  playerFriendlyNames: {},
};
