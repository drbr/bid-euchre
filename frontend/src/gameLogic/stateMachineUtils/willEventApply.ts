import { StateSchema, EventObject, StateMachine, State } from 'xstate';

/**
 * Runs the given event through the machine's pure transition function to see if it will effect any
 * changes in the context or state value. This takes into account the machine's guards and actions,
 * unlike `state.handles(event)`, which looks only at the event type.
 */
export function willEventApply<
  C,
  SS extends StateSchema,
  E extends EventObject
>(
  machine: StateMachine<C, SS, E>,
  currentState: State<C, E>,
  event: E
): boolean {
  try {
    return machine.transition(currentState, event).changed ?? false;
  } catch (e) {
    return false;
  }
}
