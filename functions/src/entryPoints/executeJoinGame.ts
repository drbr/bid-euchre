import * as _ from 'lodash';
import { generateHardToGuessId } from '../databaseHelpers/generateId';
import * as DAO from '../databaseHelpers/BackendDAO';

import {
  JoinGameRequest,
  JoinGameResult,
} from '../../apiContract/cloudFunctions/JoinGame';
import { initializeGameStates } from '../stateMachineUtils/initializeGameStates';
import { GAME_NOT_FOUND_ERROR, INVALID_GAME_STATUS_ERROR } from '..';

export default async function executeJoinGame(
  request: JoinGameRequest
): Promise<JoinGameResult> {
  const { gameId, position, friendlyName } = request;
  const playerId = generateHardToGuessId();

  const gameInfo = await DAO.getGameInfo({ gameId });
  if (!gameInfo) {
    throw new GAME_NOT_FOUND_ERROR();
  }
  if (gameInfo.gameConfig.gameStatus !== 'waitingToStart') {
    throw new INVALID_GAME_STATUS_ERROR();
  }

  await DAO.transactionallyAddPlayerIdentityToGameAtPosition({
    gameId,
    playerId,
    position,
  });
  await DAO.setPlayerNameAtPosition({ gameId, friendlyName, position });

  const playerIdentities = await DAO.getPlayerIdentities({ gameId });
  if (_.size(playerIdentities) === 4 && _.every(playerIdentities)) {
    await initializeGameStates({
      gameId,
      playerIdentities,
    });
  }

  return { playerId, gameId, position, friendlyName };
}
