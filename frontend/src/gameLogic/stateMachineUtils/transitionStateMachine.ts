import * as _ from 'lodash';
import { interpret } from 'xstate';
import { SimpleDeferred } from '../utils/SimpleDeferred';
import { GameStateMachine } from '../euchreStateMachine/GameStateMachine';
import { GameEvent, GameState } from '../euchreStateMachine/GameStateTypes';
import { HydratedGameState } from './serializeAndHydrateState';

/**
 * Thrown if the state machine does not accept the event.
 */
export class INVALID_STATE_TRANSITION_ERROR {}

export async function transitionStateMachine(
  prev: HydratedGameState,
  event: GameEvent
): Promise<GameState> {
  const deferred = new SimpleDeferred<GameState>();
  let ignoredInitialStateCallback = false;

  const machineService = interpret(GameStateMachine)
    .onTransition((state, event) => {
      // The `onTransition` callback gets invoked on the machine's initial state, so we need to
      // ignore the first invocation otherwise we'd resolve the promise before the transition even
      // happens. We continue to let the state machine run until it's finished executing all of its
      // internal activities.
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
  const nextState = await deferred.promise;

  if (!nextState.changed) {
    throw new INVALID_STATE_TRANSITION_ERROR();
  }

  // Manually increment the event count to help keep the clients and server in sync.
  // For every transition, we'll increase the event count by 1. We used to have the state machine
  // do this automatically via a parallel state node at the root, but that caused every state's
  // `changed` attribute to be true even when nothing in the actual game context changed. So now we
  // take care of this outside of the state machine.
  const prevEventCount = prev?.hydratedState?.context.eventCount ?? null;
  const nextEventCount = (prevEventCount || 0) + 1;
  nextState.context.eventCount = nextEventCount;
  nextState.context.previousEventCount = prevEventCount;

  return nextState;
}
