import { generateHardToGuessId } from '../databaseHelpers/generateId';
import * as DAO from '../databaseHelpers/WriteDAO';

import {
  JoinGameRequest,
  JoinGameResult,
} from '../../apiContract/cloudFunctions/JoinGame';

export default async function executeJoinGame(
  request: JoinGameRequest
): Promise<JoinGameResult> {
  const { gameId, position, friendlyName } = request;
  const playerId = generateHardToGuessId();

  await DAO.addPlayerIdToGameAtPosition({ gameId, playerId, position });
  await DAO.setPlayerNameAtPosition({ gameId, friendlyName, position });

  return { playerId };
}
