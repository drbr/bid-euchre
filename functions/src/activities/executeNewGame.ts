import { nanoid } from 'nanoid';
import { GameDB } from '../../apiContract/database/GameDB';
import { NewGameResult } from '../../apiContract/functions/NewGame';

import { tryCreatingListNodeWithData } from '../database/tryCreatingNode';

export default async function executeNewGame(): Promise<NewGameResult> {
  const data: GameDB = {
    randomValue: Math.floor(Math.random() * 10000),
  };

  const createdGame = await tryCreatingListNodeWithData({
    path: 'games',
    data,
    generateId: () => nanoid(10),
  });

  return { gameId: createdGame.key || '' };
}
