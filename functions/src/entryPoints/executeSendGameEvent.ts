import * as _ from 'lodash';
import { GAME_NOT_FOUND_ERROR, INVALID_GAME_STATUS_ERROR } from '..';
import { PlayerSpecificEvent } from '../../../frontend/src/gameLogic/stateMachineUtils/SpecialEvents';
import {
  SendGameEventRequest,
  SendGameEventResult,
} from '../../apiContract/cloudFunctions/SendGameEvent';
import { Position } from '../../apiContract/database/GameState';
import * as DAO from '../databaseHelpers/BackendDAO';
import { incrementStateMachineAndTransactionallyStoreResult } from '../stateMachineUtils/incrementAndStoreState';

/**
 * Thrown if the user is not in the game
 */
export class USER_NOT_AUTHORIZED_ERROR {}

/**
 * Thrown if the state has been updated since this event was sent.
 * This is determined by comparing the `existingEventCount` field from the request
 * against the `eventCount` field in the state.
 */
export class STALE_STATE_ERROR {}

export default async function executeSendGameEvent(
  request: SendGameEventRequest
): Promise<SendGameEventResult> {
  const { event, gameId, playerId } = request;

  // Make sure the game exists, is underway, and the current player is participating in it.
  const gameConfig = await DAO.getGameConfig({ gameId });
  if (!gameConfig) {
    throw new GAME_NOT_FOUND_ERROR();
  }

  if (gameConfig.gameStatus !== 'inProgress') {
    throw new INVALID_GAME_STATUS_ERROR();
  }

  const playerIdentities = await DAO.getPlayerIdentities({ gameId });
  const playerPositionInThisGame = _.findKey(
    playerIdentities,
    (pid) => pid === playerId
  ) as Position | undefined;
  if (!playerPositionInThisGame) {
    throw new USER_NOT_AUTHORIZED_ERROR();
  }

  // If the action is for a specific player, make sure the current player is submitting it
  const positionEvent = event as PlayerSpecificEvent;
  if (
    positionEvent.position &&
    positionEvent.position !== playerPositionInThisGame
  ) {
    throw new USER_NOT_AUTHORIZED_ERROR();
  }

  await incrementStateMachineAndTransactionallyStoreResult(
    request,
    playerIdentities
  );

  // Once the state is successfully updated, push the event to the server's private record.
  await DAO.pushGameEvent({ gameId, event });
}
