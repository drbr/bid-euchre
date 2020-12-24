import { assign, Machine, send, State } from 'xstate';
import { HydratedGameState } from '../../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { TypedStateSchema } from '../../gameLogic/stateMachineUtils/TypedStateInterfaces';

export type StateBuffer = {
  currentIndex: number | null;
  states: ReadonlyArray<HydratedGameState>;
};

export const LINGER_DELAY_MS = 2000;

export type BufferStatesGeneric<T> = {
  showStateLingering: T;
  showStateBlocking: T;
  showStateUnblocked: T;
  showStateDetached: T;
  prepareToShowNextState: T;
};

export type BufferStateSchema = {
  states: BufferStatesGeneric<TypedStateSchema<unknown, StateBuffer>>;
};

export type BufferStateName = keyof BufferStatesGeneric<unknown>;

type RecvNextStateEvent = {
  type: 'RECV_NEXT_STATE';
  newState: HydratedGameState;
};

type SwitchToIndexEvent = {
  type: 'SWITCH_TO';
  index: number;
};

export type BufferEvent =
  | RecvNextStateEvent
  | { type: 'GO_FORWARD_ONE' }
  | { type: 'GO_BACK_ONE' }
  | SwitchToIndexEvent
  | { type: 'UNBLOCK' };

export type BufferState = State<StateBuffer, BufferEvent, BufferStateSchema>;

/**
 * This machine controls how the UI transitions through the game states. The states can be sent to
 * the client in quick succession, but the UI does not necessarily display them right away; it might
 * block or linger on certain states, storing the newer states in a buffer and transitioning only
 * when the appropriate user interactions have occurred.
 */
export const BufferStateMachine = Machine<
  StateBuffer,
  BufferStateSchema,
  BufferEvent
>({
  id: 'BufferMachine',
  strict: true,
  initial: 'showStateUnblocked',
  context: {
    currentIndex: null,
    states: [],
  },
  on: {
    RECV_NEXT_STATE: { actions: assign(addStateToBuffer) },
    SWITCH_TO: {
      target: 'showStateDetached',
      actions: assign(setCurrentIndex),
    },
    GO_FORWARD_ONE: {
      target: 'showStateDetached',
      actions: assign((context) =>
        setCurrentIndex(context, {
          type: 'SWITCH_TO',
          index: (context.currentIndex || 0) + 1,
        })
      ),
    },
    GO_BACK_ONE: {
      target: 'showStateDetached',
      actions: assign((context) =>
        setCurrentIndex(context, {
          type: 'SWITCH_TO',
          index: (context.currentIndex || 0) - 1,
        })
      ),
    },
  },
  states: {
    showStateLingering: {
      entry: send('UNBLOCK', { delay: LINGER_DELAY_MS }),
      always: { target: 'showStateBlocking' },
    },
    showStateBlocking: {
      on: {
        UNBLOCK: { target: 'showStateUnblocked' },
      },
    },
    showStateUnblocked: {
      always: {
        // upon entry, immediately transition to next state if next state is available
        cond: nextStateIsAvailable,
        target: 'prepareToShowNextState',
      },
    },
    prepareToShowNextState: {
      entry: assign(safelyAdvanceToNextState),
      always: [
        {
          cond: nextStateLingers,
          target: 'showStateLingering',
        },
        {
          cond: nextStateBlocks,
          target: 'showStateBlocking',
        },
        {
          target: 'showStateUnblocked',
        },
      ],
    },
    showStateDetached: {
      always: {
        target: 'showStateUnblocked',
        cond: isOnMostRecentState,
      },
    },
  },
});

function addStateToBuffer(
  prevBuffer: StateBuffer,
  event: RecvNextStateEvent
): StateBuffer {
  if (!event.newState) {
    throw new Error('Tried to add a null object into the state buffer');
  }

  const index = event.newState.hydratedState.context.eventCount;
  const clonedStates = Array.from(prevBuffer.states);
  clonedStates[index] = event.newState;

  return {
    // If this is the first event to be populated, set the current index to one less,
    // so the newly-populated event will be the "next state"
    currentIndex: prevBuffer.currentIndex ?? index - 1,
    states: clonedStates,
  };
}

function nextStateIsAvailable(context: StateBuffer): boolean {
  const nextIndex = (context.currentIndex || 0) + 1;
  return !!context.states[nextIndex];
}

function isOnMostRecentState(context: StateBuffer): boolean {
  const lastIndex = context.states.length - 1;
  return context.currentIndex === lastIndex;
}

function safelyAdvanceToNextState(prevBuffer: StateBuffer): StateBuffer {
  if (!nextStateIsAvailable(prevBuffer)) {
    throw new Error(
      'Tried to advance to the next state, but it is not in buffer'
    );
  }
  if (!prevBuffer.currentIndex) {
    throw new Error('Buffer is not currently displaying any state');
  }
  return {
    ...prevBuffer,
    currentIndex: prevBuffer.currentIndex + 1,
  };
}

function setCurrentIndex(
  prevBuffer: StateBuffer,
  event: SwitchToIndexEvent
): StateBuffer {
  return {
    ...prevBuffer,
    currentIndex: event.index,
  };
}

function nextStateLingers(context: StateBuffer, event: BufferEvent): boolean {
  // Possibly in the future we will have a special action or some way to indicate
  // that the next state should not block or linger
  return true;
}

function nextStateBlocks(context: StateBuffer, event: BufferEvent): boolean {
  // Possibly in the future we will have a special action or some way to indicate
  // that the next state should not block or linger
  return false;
}
