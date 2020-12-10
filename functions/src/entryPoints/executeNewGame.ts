import { NewGameResult } from '../../apiContract/cloudFunctions/NewGame';
import { generateFriendlyId } from '../databaseHelpers/generateId';
import * as DAO from '../databaseHelpers/BackendDAO';

import { GameConfig } from '../../apiContract/database/DataModel';

export default async function executeNewGame(): Promise<NewGameResult> {
  const publicGameConfig = await DAO.transactionallyCreateGameConfig({
    value: InitialGameConfig,
    generateKey: generateFriendlyId,
  });

  return { gameId: publicGameConfig.key || '' };
}

const InitialGameConfig: GameConfig = {
  gameStatus: 'waitingToStart',
  playerFriendlyNames: {
    north: null,
    south: null,
    east: null,
    west: null,
  },
};
