import * as _ from 'lodash';
import { GAME_NOT_FOUND_ERROR, INVALID_GAME_STATUS_ERROR } from '..';
import {
  SendGameEventRequest,
  SendGameEventResult,
} from '../../apiContract/cloudFunctions/SendGameEvent';
import * as DAO from '../databaseHelpers/BackendDAO';
import { incrementStateMachineAndTransactionallyStoreResult } from '../gameLogic/incrementAndStoreState';

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

/**
 * Thrown if the state machine does not accept the event.
 */
export class INVALID_STATE_TRANSITION_ERROR {}

export default async function executeSendGameEvent(
  request: SendGameEventRequest
): Promise<SendGameEventResult> {
  const { event, gameId, playerId } = request;

  // Make sure the game exists, is underway, and the current player is participating in it.
  const gameInfo = await DAO.getGameInfo({ gameId });
  if (!gameInfo) {
    throw new GAME_NOT_FOUND_ERROR();
  }

  if (gameInfo.gameConfig.gameStatus !== 'inProgress') {
    throw new INVALID_GAME_STATUS_ERROR();
  }

  const playerIsPartOfThisGame = _.includes(
    gameInfo.playerIdentities,
    playerId
  );
  if (!playerIsPartOfThisGame) {
    throw new USER_NOT_AUTHORIZED_ERROR();
  }

  await incrementStateMachineAndTransactionallyStoreResult(request, gameInfo);

  // Once the state is successfully updated, push the event to the server's private record.
  await DAO.pushGameEvent({ gameId, event });
}
