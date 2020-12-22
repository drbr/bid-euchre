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
  simpleEventWithTransientState: T;
  destination: T;
  autoTransition1: T;
  autoTransition2: T;
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
  context: {
    eventCount: 4,
    previousEventCount: null,
  },
  states: {
    entry: {
      on: {
        simpleEvent: 'simpleEvent',
        simpleEventWithTransientState: 'simpleEventWithTransientState',
        autoTransition1: 'autoTransition1',
        autoTransition2: 'autoTransition2',
      },
    },
    destination: {
      on: { NEXT: 'entry' },
    },
    simpleEvent: {
      on: { NEXT: 'entry' },
    },
    simpleEventWithTransientState: {
      always: 'destination',
    },
    autoTransition1: {
      on: { AUTO_TRANSITION: 'destination' },
    },
    autoTransition2: {
      on: { AUTO_TRANSITION: 'autoTransition1' },
    },
  },
});
