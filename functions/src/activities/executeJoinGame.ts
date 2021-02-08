import * as _ from 'lodash';
import { GAME_NOT_FOUND_ERROR, INVALID_GAME_STATUS_ERROR } from '..';
import {
  JoinGameRequest,
  JoinGameResult,
} from '../../../frontend/src/gameLogic/apiContract/cloudFunctions/JoinGame';
import * as DAO from '../databaseHelpers/BackendDAO';
import { generateHardToGuessId } from '../databaseHelpers/generateId';
import { initializeGameStates } from './initializeGameStates';

export default async function executeJoinGame(
  request: JoinGameRequest
): Promise<JoinGameResult> {
  const { gameId, position, friendlyName: rawFriendlyName } = request;
  const normalizedFriendlyName = rawFriendlyName.trim();
  const playerId = generateHardToGuessId();

  const gameConfig = await DAO.getGameConfig({ gameId });
  if (!gameConfig) {
    throw new GAME_NOT_FOUND_ERROR();
  }
  if (gameConfig.gameStatus !== 'waitingToStart') {
    throw new INVALID_GAME_STATUS_ERROR();
  }

  await DAO.transactionallyAddPlayerIdentityToGameAtPosition({
    gameId,
    playerId,
    position,
  });
  await DAO.setPlayerNameAtPosition({
    gameId,
    friendlyName: normalizedFriendlyName,
    position,
  });

  const playerIdentities = await DAO.getPlayerIdentities({ gameId });
  if (_.size(playerIdentities) === 4 && _.every(playerIdentities)) {
    await initializeGameStates({
      gameId,
      playerIdentities,
    });
  }

  return { playerId, gameId, position, friendlyName: normalizedFriendlyName };
}
