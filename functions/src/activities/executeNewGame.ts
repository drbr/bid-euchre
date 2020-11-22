import { GameDB } from '../../apiContract/database/GameDB';
import { NewGameResult } from '../../apiContract/functions/NewGame';
import { generateFriendlyId } from '../database/generateFriendlyId';

import { tryCreatingListNodeWithData } from '../database/tryCreatingNode';

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
