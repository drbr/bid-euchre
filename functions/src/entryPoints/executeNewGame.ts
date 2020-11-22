import { GameDB } from '../../apiContract/database/GameDB';
import { NewGameResult } from '../../apiContract/cloudFunctions/NewGame';
import { generateFriendlyId } from '../databaseHelpers/generateFriendlyId';

import { tryCreatingListNodeWithData } from '../databaseHelpers/tryCreatingNode';

export default async function executeNewGame(): Promise<NewGameResult> {
  const data: GameDB = {
    randomValue: Math.floor(Math.random() * 10000),
  };

  const createdGame = await tryCreatingListNodeWithData({
    path: 'games',
    data,
    generateId: generateFriendlyId,
  });

  return { gameId: createdGame.key || '' };
}
