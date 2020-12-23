import { NewGameResult } from '../../apiContract/cloudFunctions/NewGame';
import { generateFriendlyId } from '../databaseHelpers/generateId';
import * as DAO from '../databaseHelpers/BackendDAO';

import { AllGameInfo } from '../../apiContract/database/DataModel';
import { Position } from '../../apiContract/database/GameState';

export default async function executeNewGame(): Promise<NewGameResult> {
  const publicGameConfig = await DAO.transactionallyCreateGameInfo({
    value: InitialGameInfo,
    generateGameId: generateFriendlyId,
  });

  return { gameId: publicGameConfig.key || '' };
}

const nullPositionRecord: Record<Position, null> = {
  north: null,
  south: null,
  east: null,
  west: null,
};

const InitialGameInfo: AllGameInfo = {
  gameStates: {
    fullJson: '{}',
    publicJson: '{}',
    privateJson: {},
  },
  gameConfig: {
    gameStatus: 'waitingToStart',
    playerFriendlyNames: nullPositionRecord,
  },
  playerIdentities: nullPositionRecord,
};
