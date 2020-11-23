import { generateHardToGuessId } from '../databaseHelpers/generateId';
import { DatabaseNodes } from '../databaseHelpers/DatabaseNodes';

import {
  setNode,
  transactionallyCreateChildNode,
} from '../databaseHelpers/CrudHelpers';
import {
  JoinGameRequest,
  JoinGameResult,
} from '../../apiContract/cloudFunctions/JoinGame';

export default async function executeJoinGame(
  request: JoinGameRequest
): Promise<JoinGameResult> {
  const { gameId, position, friendlyName } = request;
  const playerId = generateHardToGuessId();

  await transactionallyCreateChildNode({
    path: DatabaseNodes.playerIdentitiesForGame(gameId),
    value: playerId,
    generateKey: () => position,
    tries: 1,
  });

  await setNode({
    path: `${DatabaseNodes.publicGameConfigForGame(gameId)}/${position}`,
    value: friendlyName,
  });

  return { playerId };
}
