import { NewGameResult } from '../../../frontend/src/gameLogic/apiContract/cloudFunctions/NewGame';
import { AllGameInfo } from '../../../frontend/src/gameLogic/apiContract/database/DataModel';
import { Position } from '../../../frontend/src/gameLogic/apiContract/database/GameState';
import * as DAO from '../databaseHelpers/BackendDAO';
import { generateFriendlyId } from '../databaseHelpers/generateId';

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
    publicJson: [],
    privateJson: {},
  },
  gameConfig: {
    gameStatus: 'waitingToStart',
    playerFriendlyNames: nullPositionRecord,
  },
  playerIdentities: nullPositionRecord,
};
