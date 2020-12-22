import * as _ from 'lodash';
import { AnyEventObject, interpret, State, StateMachine } from 'xstate';
import {
  HydratedState,
  sanitizeStateMetadata,
} from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';
import {
  AutoTransitionEvent,
  SecretActionCompleteEvent,
} from '../../../frontend/src/gameLogic/stateMachineUtils/SpecialEvents';
import { EventCountContext } from '../../../frontend/src/gameLogic/stateMachineUtils/TypedStateInterfaces';
import { SimpleDeferred } from '../../../frontend/src/gameLogic/utils/SimpleDeferred';

/**
 * Thrown if the state machine does not accept the event.
 */
export class INVALID_STATE_TRANSITION_ERROR extends Error {}

const AUTO_TRANSITION: AutoTransitionEvent['type'] = 'AUTO_TRANSITION';
const SECRET_ACTION_COMPLETE: SecretActionCompleteEvent['type'] =
  'SECRET_ACTION_COMPLETE';

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
  E extends AnyEventObject,
  SS
>(
  stateMachine: StateMachine<C, SS, E>,
  prev: HydratedState<C, E, SS>,
  event: E
): Promise<State<C, E, SS>[]> {
  const machineService = interpret(stateMachine);

  try {
    const deferred = new SimpleDeferred<State<C, E, SS>[]>();
    const transitionedStates: State<C, E, SS>[] = [];

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
          const { processedState, finished, sendEvent } = processNextState(
            mostRecentPreviousState,
            state
          );

          if (processedState) {
            transitionedStates.push(processedState);
          }
          if (sendEvent) {
            machineService.send(sendEvent);
          }
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

    if (!machineService.machine.handles(event)) {
      throw new INVALID_STATE_TRANSITION_ERROR();
    }
    machineService.send(event);
    return await deferred.promise;
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    } else {
      throw new INVALID_STATE_TRANSITION_ERROR(e);
    }
  } finally {
    machineService.stop();
  }
}

/**
 * Processes the transitioned state, adding the `eventCount` bookkeeping in-place.
 *
 * @throws
 *   - `INVALID_STATE_TRANSITION_ERROR` if `nextState` is not changed.
 *   - `Error` if a valid state was reached but the state machine is not configured according to the
 *     machine's expectations
 * @returns
 *   - `finished` – true if this is the last state we expect to get from the machine
 *   - `processedState` – the version of the state to expose externally, or undefined if it
 *     shouldn't be exposed
 *   - `sendEvent` – the type of the event (if any) that should be sent back into the machine to
 *     continue the transition
 */
function processNextState<
  C extends EventCountContext,
  E extends AnyEventObject,
  SS
>(
  prevState: { context: C },
  nextState: State<C, E, SS>
): {
  processedState?: State<C, E, SS>;
  finished: boolean;
  sendEvent?: typeof AUTO_TRANSITION | typeof SECRET_ACTION_COMPLETE;
} {
  // Non-enumerated events should get caught by the machine itself, but it's still possible to send
  // an event with the wrong parameters that doesn't match any conditions. Those events get caught
  // here.
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

  const processedState = sanitizeStateMetadata(nextState) as State<C, E, SS>;
  const hasAnyOutstandingActivities = _.some(nextState.activities);
  const nextEvents = nextState.nextEvents;

  if (nextEvents.includes(AUTO_TRANSITION)) {
    if (nextEvents.length > 1) {
      throw new Error(
        `State ${nextState.value} may not respond to events in addition to AUTO_TRANSITION`
      );
    }
    if (hasAnyOutstandingActivities) {
      throw new Error(
        `Tried to auto-transition from state ${nextState.value}, but there were still activities in progress`
      );
    }
    return {
      processedState,
      finished: false,
      sendEvent: 'AUTO_TRANSITION',
    };
  } else if (nextEvents.includes(SECRET_ACTION_COMPLETE)) {
    if (nextEvents.length > 1) {
      throw new Error(
        `State ${nextState.value} may not respond to events in addition to SECRET_ACTION_COMPLETE`
      );
    }
    if (hasAnyOutstandingActivities) {
      throw new Error(
        `Tried to auto-transition from state ${nextState.value}, but there were still activities in progress`
      );
    }
    return {
      finished: false,
      sendEvent: 'SECRET_ACTION_COMPLETE',
    };
  } else {
    return {
      processedState,
      finished: !hasAnyOutstandingActivities,
    };
  }
}
