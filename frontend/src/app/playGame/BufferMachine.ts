import { Machine, State } from 'xstate';
import { HydratedGameState } from '../../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { TypedStateSchema } from '../../gameLogic/stateMachineUtils/TypedStateInterfaces';

export type StateBuffer = {
  currentIndex: number | null;
  states: ReadonlyArray<HydratedGameState>;
};

export type BufferStatesGeneric<T> = {
  entry: T;
  showStateBlocking: T;
  showStateUnblocked: T;
  showStateDetached: T;
  isNextStateAvailable: T;
  doesNextStateBlock: T;
};

export type BufferStateSchema = {
  states: BufferStatesGeneric<TypedStateSchema<unknown, StateBuffer>>;
};

export type BufferStateName = keyof BufferStatesGeneric<unknown>;

export type BufferEvent =
  | {
      type: 'RECV_NEXT_STATE';
      newState: HydratedGameState;
    }
  | { type: 'GO_FORWARD' }
  | { type: 'GO_BACK' }
  | {
      type: 'SWITCH_TO';
      index: number;
    }
  | {
      type: 'UNBLOCK';
    };

export type BufferState = State<StateBuffer, BufferEvent, BufferStateSchema>;

/**
 * This machine is used in the unit tests to exercise the `transitionStateMachine` function.
 */
export const BufferStateMachine = Machine<
  StateBuffer,
  BufferStateSchema,
  BufferEvent
>({
  id: 'BufferMachine',
  strict: true,
  initial: 'entry',
  context: {
    currentIndex: null,
    states: [],
  },
  states: {
    entry: {},
    showStateBlocking: {},
    showStateUnblocked: {},
    showStateDetached: {},
    isNextStateAvailable: {},
    doesNextStateBlock: {},
  },
});
