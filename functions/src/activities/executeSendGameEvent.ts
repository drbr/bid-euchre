import * as _ from 'lodash';
import { AnyEventObject } from 'xstate';
import { GAME_NOT_FOUND_ERROR, INVALID_GAME_STATUS_ERROR } from '..';
import {
  SendGameEventRequest,
  SendGameEventResult,
} from '../../../frontend/src/gameLogic/apiContract/cloudFunctions/SendGameEvent';
import { Position } from '../../../frontend/src/gameLogic/apiContract/database/Position';
import { PlayerSpecificEvent } from '../../../frontend/src/gameLogic/stateMachineUtils/SpecialEvents';
import * as DAO from '../databaseHelpers/BackendDAO';
import { incrementStateMachineAndTransactionallyStoreResult } from './incrementAndStoreState';

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

  // Make sure the game exists and it's underway
  const gameConfig = await DAO.getGameConfig({ gameId });
  if (!gameConfig) {
    throw new GAME_NOT_FOUND_ERROR();
  }

  if (gameConfig.gameStatus !== 'inProgress') {
    throw new INVALID_GAME_STATUS_ERROR();
  }

  // Make sure the player submitting the event is participating in the game
  const playerIdentities = await DAO.getPlayerIdentities({ gameId });
  const playerPositionInThisGame = _.findKey(
    playerIdentities,
    (pid) => pid === playerId
  ) as Position | undefined;
  if (!playerPositionInThisGame) {
    throw new USER_NOT_AUTHORIZED_ERROR();
  }

  // If the action is for a specific player, make sure it's the player submitting the event
  const positionEvent = event as PlayerSpecificEvent<AnyEventObject>;
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
