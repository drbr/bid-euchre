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
  respondsToAutoTransitionAndNext: T;
  respondsToAutoTransitionAndDone: {
    states: {
      first: T;
      second: T;
    };
  };
  secretAction: T;
  invokeSecretAction: T;
  respondsToSecretActionAndNext: T;
  invokePromise: T;
  invokeANonEnumeratedEvent: T;
  invokeAndAutoTransition: T;
  transitionOnlyIfTruthy: T;
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

export const INITIAL_EVENT_COUNT = 4;

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
    eventCount: INITIAL_EVENT_COUNT,
    previousEventCount: null,
  },
  states: {
    entry: {
      on: {
        simpleEvent: 'simpleEvent',
        simpleEventWithTransientState: 'simpleEventWithTransientState',
        autoTransition1: 'autoTransition1',
        autoTransition2: 'autoTransition2',
        respondsToAutoTransitionAndNext: 'respondsToAutoTransitionAndNext',
        respondsToAutoTransitionAndDone: 'respondsToAutoTransitionAndDone',
        secretAction: 'secretAction',
        invokeSecretAction: 'invokeSecretAction',
        respondsToSecretActionAndNext: 'respondsToSecretActionAndNext',
        invokePromise: 'invokePromise',
        invokeANonEnumeratedEvent: 'invokeANonEnumeratedEvent',
        invokeAndAutoTransition: 'invokeAndAutoTransition',
        transitionOnlyIfTruthy: {
          target: 'transitionOnlyIfTruthy',
          cond: (context, event) => !!(event as { data?: string }).data,
        },
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
    respondsToAutoTransitionAndNext: {
      on: {
        AUTO_TRANSITION: 'entry',
        NEXT: 'entry',
      },
    },
    respondsToAutoTransitionAndDone: {
      initial: 'first',
      states: {
        first: {
          on: { AUTO_TRANSITION: 'second' },
        },
        second: { type: 'final' },
      },
      onDone: 'destination',
    },
    secretAction: {
      on: { SECRET_ACTION_COMPLETE: 'destination' },
    },
    invokeSecretAction: {
      on: { NEXT: 'secretAction' },
      invoke: {
        src: () => (callback) => {
          callback({ type: 'NEXT', data: 'TOP SECRET' });
        },
      },
    },
    respondsToSecretActionAndNext: {
      on: {
        SECRET_ACTION_COMPLETE: 'entry',
        NEXT: 'entry',
      },
    },
    invokePromise: {
      invoke: {
        src: () => () => Promise.resolve(),
        onDone: 'destination',
      },
    },
    invokeANonEnumeratedEvent: {
      invoke: {
        src: () => (callback) => callback('NEXT'),
      },
    },
    invokeAndAutoTransition: {
      on: { AUTO_TRANSITION: 'entry' },
      invoke: {
        src: () => (callback) => callback('NEXT'),
      },
    },
    transitionOnlyIfTruthy: {
      on: { NEXT: 'entry' },
    },
  },
});
