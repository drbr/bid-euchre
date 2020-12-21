import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import { interpret } from 'xstate';
import { SimpleDeferred } from '../../../frontend/src/gameLogic/utils/SimpleDeferred';
import { GameStateMachine } from '../../../frontend/src/gameLogic/euchreStateMachine/GameStateMachine';
import {
  GameEvent,
  GameState,
} from '../../../frontend/src/gameLogic/euchreStateMachine/GameStateTypes';
import { HydratedGameState } from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';

/**
 * Thrown if the state machine does not accept the event.
 */
export class INVALID_STATE_TRANSITION_ERROR {}

export async function transitionStateMachine(
  prev: HydratedGameState,
  event: GameEvent
): Promise<GameState> {
  const nextState = await runMachineInIsolation(prev, event);

  if (!nextState.changed) {
    throw new INVALID_STATE_TRANSITION_ERROR();
  }

  // Manually increment the event count to help keep the clients and server in sync. For every
  // transition, we'll increase the event count by 1. Previously, we had the state machine do this
  // automatically via a parallel state node at the root, but that caused every state's `changed`
  // attribute to be true even when nothing else changed. So now we do it manually.
  const prevEventCount = prev?.hydratedState?.context.eventCount ?? null;
  const nextEventCount = (prevEventCount || 0) + 1;
  nextState.context.eventCount = nextEventCount;
  nextState.context.previousEventCount = prevEventCount;

  return nextState;
}

async function runMachineInIsolation(
  prev: HydratedGameState,
  event: GameEvent
): Promise<GameState> {
  try {
    const deferred = new SimpleDeferred<GameState>();
    let ignoredInitialStateCallback = false;
    const machineService = interpret(GameStateMachine)
      .onTransition((state) => {
        // The `onTransition` callback gets invoked on the machine's initial state, so we need to
        // ignore the first invocation otherwise we'd resolve the promise before the transition even
        // happens. We continue to let the state machine run until it's finished executing all of
        // its internal activities.
        if (ignoredInitialStateCallback) {
          const hasAnyOutstandingActivities = _.some(state.activities);
          if (!hasAnyOutstandingActivities) {
            deferred.resolve(state);
          }
        }
        ignoredInitialStateCallback = true;
      })
      .start(prev.hydratedState);

    machineService.send(event);
    return await deferred.promise;
  } catch (e) {
    // The state machine runs in Strict Mode, so an event not enumerated in the state machine should
    // get caught here.
    functions.logger.error(e);
    throw new INVALID_STATE_TRANSITION_ERROR();
  }
}
