import * as _ from 'lodash';
import { AnyEventObject, interpret, State, StateMachine } from 'xstate';
import {
  HydratedState,
  sanitizeStateMetadata,
} from './serializeAndHydrateState';
import {
  AutoTransitionEvent,
  SecretActionCompleteEvent,
} from './SpecialEvents';
import { EventCountContext } from './TypedStateInterfaces';
import { SimpleDeferred } from '../utils/SimpleDeferred';

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
 * TODO: The type definition may be wrong here – does it return a hydrated State object, or
 * merely a sanitized StateConfig?
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
): Promise<ReadonlyArray<State<C, E>>> {
  const initialContext = prev.hydratedState.context;
  const machineService = interpret(stateMachine.withContext(initialContext));

  try {
    const deferred = new SimpleDeferred<void>();
    const transitionedStates: State<C, E, SS>[] = [];

    let ignoredInitialStateCallback = false;
    machineService.onTransition((state) => {
      // The `onTransition` callback gets invoked on the machine's initial state, so we need to
      // ignore the first invocation otherwise we'd resolve the promise before the transition even
      // happens. We continue to let the state machine run until it's finished executing all of
      // its internal activities.
      if (ignoredInitialStateCallback) {
        try {
          const { expose, finished, sendEvent } = processNextState(state);

          if (expose) {
            transitionedStates.push(state);
          }

          if (sendEvent) {
            machineService.send(sendEvent);
          } else if (finished) {
            deferred.resolve();
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
    await deferred.promise;
    return sanitizeStateAndAssignEventCounts(
      transitionedStates,
      prev.hydratedState.context.eventCount || 0
    );
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
 * Processes the transitioned state to figure out how we should respond.
 *
 * @throws
 *   - `INVALID_STATE_TRANSITION_ERROR` if `nextState` is not changed.
 *   - `Error` if a valid state was reached but the state machine is not configured according to the
 *     machine's expectations
 * @returns
 *   - `finished` – true if this is the last state we expect to get from the machine
 *   - `expose` – true if this state should be exposed to the outside world
 *     shouldn't be exposed
 *   - `sendEvent` – the type of the event (if any) that should be sent back into the machine to
 *     continue the transition
 */
function processNextState<
  C extends EventCountContext,
  E extends AnyEventObject,
  SS
>(
  nextState: State<C, E, SS>
): {
  expose: boolean;
  finished: boolean;
  sendEvent?: typeof AUTO_TRANSITION | typeof SECRET_ACTION_COMPLETE;
} {
  // Non-enumerated events should get caught by the machine itself, but it's still possible to send
  // an event with the wrong parameters that doesn't match any conditions. Those events get caught
  // here.
  if (!nextState.changed) {
    throw new INVALID_STATE_TRANSITION_ERROR();
  }

  const hasAnyOutstandingActivities = _.some(nextState.activities);
  const nextEvents = getRealisticNextEvents(nextState);

  if (nextEvents.includes(AUTO_TRANSITION)) {
    if (nextEvents.length > 1) {
      throw new Error(
        `State ${JSON.stringify(
          nextState.value
        )} may not respond to events in addition to AUTO_TRANSITION`
      );
    }
    if (hasAnyOutstandingActivities) {
      throw new Error(
        `Tried to auto-transition from state ${nextState.value}, but there were still activities in progress`
      );
    }
    return {
      expose: true,
      finished: false,
      sendEvent: 'AUTO_TRANSITION',
    };
  } else if (nextEvents.includes(SECRET_ACTION_COMPLETE)) {
    if (nextEvents.length > 1) {
      throw new Error(
        `State ${JSON.stringify(
          nextState.value
        )} may not respond to events in addition to SECRET_ACTION_COMPLETE`
      );
    }
    if (hasAnyOutstandingActivities) {
      throw new Error(
        `Tried to auto-transition from state ${nextState.value}, but there were still activities in progress`
      );
    }
    return {
      expose: false,
      finished: false,
      sendEvent: 'SECRET_ACTION_COMPLETE',
    };
  } else {
    return {
      expose: true,
      finished: !hasAnyOutstandingActivities,
    };
  }
}

/**
 * If the state is within a hierarchical state machine, it responds to the `done` event, but that's
 * not something that will actually realistically get sent in, so when we're making sure an event
 * doesn't respond to automatic events and something else, we filter out certain "unrealistic"
 * events.
 */
function getRealisticNextEvents<
  C extends EventCountContext,
  E extends AnyEventObject,
  SS
>(state: State<C, E, SS>): string[] {
  return state.nextEvents.filter((e) => !e.startsWith('done.'));
}

/**
 * Sanitizes the state to reduce its size and also to hide fields that are unnecessary and may
 * contain secret data.
 *
 * Manually increments the event count to help keep the clients and server in sync. For every
 * transition, we'll increase the event count by 1. Previously, we had the state machine do this
 * automatically via a parallel state node at the root, but that caused every state's `changed`
 * attribute to be true even when nothing else changed. So now we do it manually.
 *
 * @param states The states to expose from the machine
 * @param countBasis The event count before this set of transitions happened – the `eventCount` on
 * `prevState`.
 */
function sanitizeStateAndAssignEventCounts<
  C extends EventCountContext,
  E extends AnyEventObject,
  SS
>(
  states: ReadonlyArray<State<C, E, SS>>,
  countBasis: number
): ReadonlyArray<State<C, E>> {
  return states.map(
    (s, i) =>
      ({
        ...sanitizeStateMetadata(s),
        context: {
          ...s.context,
          previousEventCount: countBasis + i,
          eventCount: countBasis + i + 1,
        },
      } as State<C, E, SS>)
  );
}
