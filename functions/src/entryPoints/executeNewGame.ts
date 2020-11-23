import { NewGameResult } from '../../apiContract/cloudFunctions/NewGame';
import { PublicGameConfig } from '../../apiContract/database/DataModel';
import { generateFriendlyId } from '../databaseHelpers/generateFriendlyId';
import { DatabaseNodes } from '../databaseHelpers/DatabaseNodes';

import { tryCreatingListNodeWithData } from '../databaseHelpers/tryCreatingNode';

export default async function executeNewGame(): Promise<NewGameResult> {
  const data: PublicGameConfig = {
    playerFriendlyNames: {
      north: randomValue(),
      south: null,
      east: randomValue(),
      west: null,
    },
  };

  const createdGame = await tryCreatingListNodeWithData({
    path: DatabaseNodes.publicGameConfig,
    data,
    generateId: generateFriendlyId,
  });

  return { gameId: createdGame.key || '' };
}

function randomValue() {
  return String(Math.floor(Math.random() * 10000));
}
