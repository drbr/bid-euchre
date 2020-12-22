import { Machine, State } from 'xstate';
import {
  AutoTransitionEvent,
  SecretActionCompleteEvent,
} from '../gameLogic/stateMachineUtils/SpecialEvents';
import {
  EventCountContext,
  TypedStateSchema,
} from '../gameLogic/stateMachineUtils/TypedStateInterfaces';

export type TransitionTestStatesGeneric<T> = {
  entry: T;
  simpleEvent: T;
};

export type TransitionTestStateSchema = {
  states: TransitionTestStatesGeneric<
    TypedStateSchema<unknown, EventCountContext>
  >;
};

export type TransitionTestStateName = keyof TransitionTestStatesGeneric<unknown>;

export type TransitionTestEvent =
  | {
      type: 'NEXT';
      data?: string;
    }
  | { type: TransitionTestStateName; data?: string }
  | AutoTransitionEvent
  | SecretActionCompleteEvent;

export type TransitionTestState = State<
  EventCountContext,
  TransitionTestEvent,
  TransitionTestStateSchema
>;

/**
 * This machine is used in the unit tests to exercise the `transitionStateMachine` function.
 */
export const TransitionTestStateMachine = Machine<
  EventCountContext,
  TransitionTestStateSchema,
  TransitionTestEvent
>({
  id: 'TransitionTestStateMachine',
  strict: true,
  initial: 'entry',
  states: {
    entry: {
      on: {
        simpleEvent: 'simpleEvent',
      },
    },
    simpleEvent: {
      on: { NEXT: 'entry' },
    },
  },
});

/*

// Happy case, one transient state
entry responds to event TEST3, which goes to TEST3A
TEST3A always goes to TEST3B
TEST3B responds to NEXT

// Two auto-transitions
entry responds to event TEST1, goes to TEST1A
TEST1A responds to AUTO_TRANSITION, goes to TEST1B
TEST1B responds to AUTO_TRANSITION, goes to TEST1C
TEST1C responds to NEXT

// Secret data in event
entry responds to event TEST2, which contains some secret info, goes to TEST2A
TEST2A responds to SECRET_EVENT_DONE, goes to TEST2B
TEST2B responds to NEXT

// Auto-invoke secret event, then shroud it
entry responds to TEST5, which goes to TEST5A
TEST5A invokes a service that sends an event with some secret stuff, which goes to TEST5B
TEST5B responds to SECRET_EVENT_DONE, goes to TEST5C
TEST5C responds to NEXT

// Secret data AND auto-invoke
entry responds to TEST6, which contains some secret info, goes to TEST6A
TEST6A responds to SECRET_EVENT_DONE, goes to TEST6B
TEST6B responds to AUTO_TRANSITION, goes to TEST6C
TEST6C responds to NEXT

// Should error if state node responds to SECRET_EVENT_DONE/AUTO_TRANSITION and something else

// Respond to non-enumerated event from entry

// Respond to non-enumerated event from after an AUTO_TRANSITION

// Respond to event without the right condition from entry

// Respond to event without the right condition from after an AUTO_TRANSITION
*/
