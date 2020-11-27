import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import { mapPositions } from '../../../frontend/src/gameLogic/ModelHelpers';
import { GameEvent } from '../../../frontend/src/gameLogic/stateMachine/GameStateTypes';
import {
  SendGameEventRequest,
  SendGameEventResult,
} from '../../apiContract/cloudFunctions/SendGameEvent';
import * as DAO from '../databaseHelpers/BackendDAO';
import { transitionStateMachine } from '../gameLogic/BackendStateMachine';

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
  const { event, existingEventCount, gameId, playerId } = request;

  const playerIdentities = await DAO.getPlayerIdentities({ gameId });
  const playerIds = mapPositions(playerIdentities, (pid) => pid);
  const playerIsPartOfThisGame = _.includes(playerIds, playerId);
  if (!playerIsPartOfThisGame) {
    throw new USER_NOT_AUTHORIZED_ERROR();
  }

  await DAO.transactionallySetPublicGameStateJson({
    gameId,
    transactionUpdate: (current) => {
      functions.logger.debug('EXECUTE got into the transaction update');
      if (!current) {
        functions.logger.debug(`EXECUTE current state is ${current}`);
        throw new STALE_STATE_ERROR();
      }
      functions.logger.debug(
        `EXECUTE Current state value: ${JSON.stringify(current?.value)}`
      );

      if (current && current.context.eventCount !== existingEventCount) {
        functions.logger.error('Stale state: event count mismatch');
        throw new STALE_STATE_ERROR();
      }

      try {
        const nextState = transitionStateMachine(current, event as GameEvent);
        functions.logger.debug(
          `EXECUTE Transitioned state value: ${JSON.stringify(
            nextState?.value
          )}`
        );

        // {
        //   functions.logger.debug(
        //     `Current state event count: ${current?.context.eventCount}`
        //   );
        //   functions.logger.debug(
        //     `Next state event count: ${nextState?.context.eventCount}`
        //   );
        //   const areStatesEqual = current === nextState;
        //   const areStatesStringEqual =
        //     JSON.stringify(current) === JSON.stringify(nextState);
        //   functions.logger.debug(
        //     `Are states equal? string: ${areStatesEqual} json: ${areStatesStringEqual}`
        //   );
        // }

        return nextState;
      } catch (e) {
        functions.logger.error(e);
        throw new INVALID_STATE_TRANSITION_ERROR();
      }
    },
  });

  await DAO.pushGameEvent({ gameId, event });
}
