import * as _ from 'lodash';
import { generateHardToGuessId } from '../databaseHelpers/generateId';
import * as DAO from '../databaseHelpers/BackendDAO';

import {
  JoinGameRequest,
  JoinGameResult,
} from '../../apiContract/cloudFunctions/JoinGame';
import { startGame } from '../gameLogic/startGame';

export default async function executeJoinGame(
  request: JoinGameRequest
): Promise<JoinGameResult> {
  const { gameId, position, friendlyName } = request;
  const playerId = generateHardToGuessId();

  await DAO.addPlayerIdToGameAtPosition({ gameId, playerId, position });
  await DAO.setPlayerNameAtPosition({ gameId, friendlyName, position });

  const playerIdentities = await DAO.getPlayerIdentities({ gameId });
  if (_.size(playerIdentities) === 4 && _.every(playerIdentities)) {
    const gameConfig = await DAO.getPublicGameConfig({ gameId });
    await startGame({ gameId, playerIdentities, gameConfig: gameConfig! });
  }

  return { playerId, gameId, position, friendlyName };
}
