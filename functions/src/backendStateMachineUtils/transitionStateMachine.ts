import * as _ from 'lodash';
import { EventObject, interpret, State, StateMachine } from 'xstate';
import { HydratedState } from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';
import { EventCountContext } from '../../../frontend/src/gameLogic/stateMachineUtils/TypedStateInterfaces';
import { SimpleDeferred } from '../../../frontend/src/gameLogic/utils/SimpleDeferred';

/**
 * Thrown if the state machine does not accept the event.
 */
export class INVALID_STATE_TRANSITION_ERROR {}

/**
 * Transitions the state machine from the given `prev` state and `event`, while also executing
 * activities involved in the transition and returning those transitions.
 *
 * As is standard for XState machines, this transition is isolated; the machine on which this
 * transition runs is local to this function, and the transition does not affect any other state. It
 * is equivalent to running `machine.transition(prev, event)`, except that this function may take
 * the machine through multiple transitions in a single invocation. As such, it returns an array of
 * states in the order that they were reached.
 *
 * @throws rejects the promise with `INVALID_STATE_TRANSITION_ERROR` if the event does not cause any
 * state changes.
 */
export async function transitionStateMachine<
  C extends EventCountContext,
  E extends EventObject,
  SS
>(
  stateMachine: StateMachine<C, SS, E>,
  prev: HydratedState<C, E, SS>,
  event: E
): Promise<State<C, E, SS>[]> {
  const machineService = interpret(stateMachine);
  const transitionedStates: State<C, E, SS>[] = [];
  const deferred = new SimpleDeferred<State<C, E, SS>[]>();

  try {
    let ignoredInitialStateCallback = false;
    machineService.onTransition((state) => {
      const mostRecentPreviousState =
        _.last(transitionedStates) ?? prev.hydratedState;

      // The `onTransition` callback gets invoked on the machine's initial state, so we need to
      // ignore the first invocation otherwise we'd resolve the promise before the transition even
      // happens. We continue to let the state machine run until it's finished executing all of
      // its internal activities.
      if (ignoredInitialStateCallback) {
        try {
          const { finished } = processNextState(mostRecentPreviousState, state);
          transitionedStates.push(state);
          if (finished) {
            deferred.resolve(transitionedStates);
          }
        } catch (e) {
          deferred.reject(e);
        }
      }
      ignoredInitialStateCallback = true;
    });

    machineService.start(prev.hydratedState);
    machineService.send(event);
    return await deferred.promise;
  } catch (e) {
    throw new INVALID_STATE_TRANSITION_ERROR();
  } finally {
    machineService.stop();
  }
}

/**
 * Processes the transitioned state, adding the `eventCount` bookkeeping in-place.
 *
 * @throws `INVALID_STATE_TRANSITION_ERROR` if `nextState` is not changed.
 * @returns `{finished: boolean}` true if this is the last state we expect to get from the machine
 */
function processNextState<
  C extends EventCountContext,
  E extends EventObject,
  SS
>(
  prevState: State<C, E, SS>,
  nextState: State<C, E, SS>
): { finished: boolean } {
  // Non-enumerated events will get caught above, but it's still possible to send an event with the
  // wrong parameters that doesn't match any conditions. Those events get caught here.
  if (!nextState.changed) {
    throw new INVALID_STATE_TRANSITION_ERROR();
  }

  // Manually increment the event count to help keep the clients and server in sync. For every
  // transition, we'll increase the event count by 1. Previously, we had the state machine do this
  // automatically via a parallel state node at the root, but that caused every state's `changed`
  // attribute to be true even when nothing else changed. So now we do it manually.
  const prevEventCount = prevState?.context.eventCount ?? null;
  const nextEventCount = (prevEventCount || 0) + 1;
  nextState.context.eventCount = nextEventCount;
  nextState.context.previousEventCount = prevEventCount;

  const hasAnyOutstandingActivities = _.some(nextState.activities);
  return {
    finished: !hasAnyOutstandingActivities,
  };
}
