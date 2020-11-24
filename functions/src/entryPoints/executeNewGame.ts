import { NewGameResult } from '../../apiContract/cloudFunctions/NewGame';
import { generateFriendlyId } from '../databaseHelpers/generateId';
import * as DAO from '../databaseHelpers/BackendDAO';

import { PublicGameConfig } from '../../apiContract/database/DataModel';

export default async function executeNewGame(): Promise<NewGameResult> {
  const publicGameConfig = await DAO.createPublicGameConfig({
    value: InitialGameConfig,
    generateKey: generateFriendlyId,
  });

  return { gameId: publicGameConfig.key || '' };
}

const InitialGameConfig: PublicGameConfig = {
  gameExists: true,
  playerFriendlyNames: {
    north: null,
    south: null,
    east: null,
    west: null,
  },
};
