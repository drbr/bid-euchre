import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import { mapPositions } from '../../../frontend/src/gameLogic/ModelHelpers';
import { GameEvent } from '../../../frontend/src/gameLogic/stateMachine/GameStateTypes';
import {
  SendGameEventRequest,
  SendGameEventResult,
} from '../../apiContract/cloudFunctions/SendGameEvent';
import * as DAO from '../databaseHelpers/BackendDAO';
import { transitionStateMachineWithInterpreter } from '../../../frontend/src/gameLogic/StateMachineHelpers';

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
  const {
    event,
    existingEventCount: eventCountFromClient,
    gameId,
    playerId,
  } = request;

  // Check that the player is participating in this game.
  const playerIdentities = await DAO.getPlayerIdentities({ gameId });
  const playerIds = mapPositions(playerIdentities, (pid) => pid);
  const playerIsPartOfThisGame = _.includes(playerIds, playerId);
  if (!playerIsPartOfThisGame) {
    throw new USER_NOT_AUTHORIZED_ERROR();
  }

  await DAO.transactionallySetGameMachineStateJson({
    gameId,
    transactionUpdate: async (current) => {
      // Before applying the event, verify that the current state is in sync
      // between the client and the server, by checking that they both have
      // the same event count. Since we transactionally update the event count
      // and the client never touches the state directly, the two event counts
      // being equal should be sufficient to know that the two states are equal.
      if (
        current &&
        current.hydratedState.context.eventCount !== eventCountFromClient
      ) {
        functions.logger.error('Stale state: event count mismatch');
        throw new STALE_STATE_ERROR();
      }

      try {
        // const nextState = transitionStateMachine(current, event as GameEvent);
        const nextState = await transitionStateMachineWithInterpreter(
          current,
          event as GameEvent
        );
        return nextState;
      } catch (e) {
        // The state machine runs in Strict Mode, so a non-enumerated event should end up here.
        functions.logger.error(e);
        throw new INVALID_STATE_TRANSITION_ERROR();
      }
    },
  });

  // Once the state is successfully updated, add the event to the server's private record.
  await DAO.pushGameEvent({ gameId, event });
}
