import { assign, Machine, send, State } from 'xstate';
import { HydratedGameState } from '../../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { TypedStateSchema } from '../../gameLogic/stateMachineUtils/TypedStateInterfaces';

/**
 * This buffer stores all the known game state snapshots and controls how the client moves through
 * them over time.
 */
export type StateBuffer = {
  /**
   * The index of the snapshot currently being displayed
   */
  readonly currentIndexShowing: number | null;

  /**
   * The index of the latest snapshot that has ever been displayed. The machine will not allow
   * advancing past the head in detached mode.
   */
  readonly head: number | null;

  /**
   * All the snapshots that are known to the client, including those past the head that have never
   * been displayed
   */
  readonly gameStateSnapshots: ReadonlyArray<HydratedGameState>;
};

export const LINGER_DELAY_MS = 1000;

export type BufferStatesGeneric<T> = {
  /**
   * The machine starts in this state until the buffer has populated all the snapshots up to and
   * including the head.
   */
  loading: T;

  loaded: {
    states: {
      /**
       * The entry point for showing a new head state. This transient node decides which of the
       * "showHead*" states should be used, based on the new head's configuration.
       */
      enterHead: T;

      /**
       * Showing the head while it's in the mandatory "linger" period. This is implemented by invoking
       * a delayed UNBLOCK_HEAD event and immediately transitioning to showHeadBlocking.
       */
      showHeadLingering: T;

      /**
       * Showing the head while it's blocked – the machine will not advance the head until it receives
       * the UNBLOCK_HEAD event.
       */
      showHeadBlocking: T;

      /**
       * Showing the head while unblocked – the head can be advanced at any time.
       */
      showHeadUnblocked: T;

      /**
       * Showing a state older than the head (one that the player has already played). In detached mode,
       * the machine can move freely from state to state, ignoring blocks or lingers.
       */
      showSnapshotDetached: T;
    };
  };
};

export type BufferStateSchema = {
  states: BufferStatesGeneric<TypedStateSchema<unknown, StateBuffer>>;
};

export type BufferStateName = keyof BufferStatesGeneric<unknown>;

type RecvNextStateEvent = {
  type: 'RECV_NEXT_STATE';
  newState: HydratedGameState;
};

type SwitchToDetachedIndexEvent = {
  type: 'DETACHED_GO_TO_INDEX';
  index: number;
};

export type BufferEvent =
  | RecvNextStateEvent
  | { type: 'DETACHED_GO_FORWARD' }
  | { type: 'DETACHED_GO_BACK' }
  | SwitchToDetachedIndexEvent
  | { type: 'UNBLOCK_HEAD' }
  | { type: 'RESET' };

export type BufferState = State<StateBuffer, BufferEvent, BufferStateSchema>;

const initialContext: StateBuffer = {
  currentIndexShowing: null,
  head: null,
  gameStateSnapshots: [],
};

/**
 * This machine controls how the UI transitions through the game states. The state snapshots can be sent to
 * the client in quick succession, but the UI does not necessarily display them right away; it might
 * block or linger on certain states, storing the newer states in the buffer and transitioning only
 * when the appropriate user interactions have occurred.
 */
export const BufferStateMachine = Machine<
  StateBuffer,
  BufferStateSchema,
  BufferEvent
>({
  id: 'BufferMachine',
  strict: true,
  initial: 'loading',
  context: initialContext,
  on: {
    RECV_NEXT_STATE: { actions: assign(addSnapshotToBuffer) },
    RESET: {
      target: 'loading',
      actions: assign(() => initialContext),
    },
  },
  states: {
    loading: {
      always: {
        target: 'loaded',
        cond: isLoadingComplete,
        actions: assign({
          currentIndexShowing: (context) => context.head,
        }),
      },
    },
    loaded: {
      initial: 'enterHead',
      on: {
        DETACHED_GO_TO_INDEX: {
          cond: (context, event) =>
            detachedIndexHasBeenSeenBefore(context, event.index),
          target: 'showSnapshotDetached',
          actions: assign({
            currentIndexShowing: (context, event) => event.index,
          }),
        },
        DETACHED_GO_FORWARD: [
          {
            target: 'showSnapshotDetached',
            cond: (context) =>
              detachedIndexHasBeenSeenBefore(
                context,
                (context.currentIndexShowing || 0) + 1
              ),
            actions: assign({
              currentIndexShowing: (context) =>
                (context.currentIndexShowing || 0) + 1,
            }),
          },
        ],
        DETACHED_GO_BACK: {
          target: 'showStateDetached',
          cond: (context) =>
            detachedIndexHasBeenSeenBefore(
              context,
              (context.currentIndexShowing || 0) - 1
            ),
          actions: assign({
            currentIndexShowing: (context) =>
              (context.currentIndexShowing || 0) - 1,
          }),
        },
      },
      states: {
        enterHead: {
          always: [
            {
              cond: nextHeadLingers,
              target: 'showHeadLingering',
            },
            {
              cond: nextHeadBlocks,
              target: 'showHeadBlocking',
            },
            {
              target: 'showHeadUNBLOCK_HEADed',
            },
          ],
        },
        showHeadLingering: {
          entry: send('UNBLOCK_HEAD', { delay: LINGER_DELAY_MS }),
          always: { target: 'showHeadBlocking' },
        },
        showHeadBlocking: {
          on: {
            UNBLOCK_HEAD: { target: 'showHeadUnblocked' },
          },
        },
        showHeadUnblocked: {
          always: {
            cond: nextSnapshotIsAvailable,
            target: 'enterHead',
            actions: safelyAdvanceHead,
          },
        },
        showSnapshotDetached: {
          // If we're on the head, leave detached mode
          always: {
            target: 'enterHead',
            cond: isAtHead,
          },
        },
      },
    },
  },
});

function addSnapshotToBuffer(
  prevBuffer: StateBuffer,
  event: RecvNextStateEvent
): StateBuffer {
  if (!event.newState) {
    throw new Error('Tried to add a null object into the state buffer');
  }

  const index = event.newState.hydratedState.context.eventCount;
  const clonedSnapshots = prevBuffer.gameStateSnapshots.slice(0);
  clonedSnapshots[index] = event.newState;

  return {
    ...prevBuffer,
    gameStateSnapshots: clonedSnapshots,
  };
}

function isLoadingComplete(context: StateBuffer) {
  const { head, gameStateSnapshots } = context;
  if (head == null) {
    return false;
  }

  // because index === event count, 0 will never exist
  for (let i = 1; i <= head; i++) {
    if (!gameStateSnapshots[i]) {
      return false;
    }
  }

  return true;
}

function nextSnapshotIsAvailable(prevBuffer: StateBuffer): boolean {
  const { currentIndexShowing, head } = prevBuffer;
  if (
    currentIndexShowing == null ||
    head == null ||
    currentIndexShowing !== head
  ) {
    throw new Error(
      `When advancing head, currentIndexShowing ${currentIndexShowing} and head ${head} must be equal`
    );
  }

  const nextIndex = currentIndexShowing + 1;
  return !!prevBuffer.gameStateSnapshots[nextIndex];
}

function nextHeadLingers(context: StateBuffer, event: BufferEvent): boolean {
  // Possibly in the future we will have a special action or some way to indicate
  // that the next state should not block or linger
  return true;
}

function nextHeadBlocks(context: StateBuffer, event: BufferEvent): boolean {
  // Possibly in the future we will have a special action or some way to indicate
  // that the next state should not block or linger
  return false;
}

function safelyAdvanceHead(prevBuffer: StateBuffer): StateBuffer {
  if (!nextSnapshotIsAvailable(prevBuffer)) {
    throw new Error('Tried to advance the head, but it is not yet in buffer');
  }
  if (!prevBuffer.currentIndexShowing) {
    throw new Error('Buffer is not currently displaying any state');
  }
  const nextIndex = prevBuffer.currentIndexShowing + 1;

  return {
    ...prevBuffer,
    currentIndexShowing: nextIndex,
    head: nextIndex,
  };
}

function isAtHead(context: StateBuffer): boolean {
  return context.currentIndexShowing === context.head;
}

function detachedIndexHasBeenSeenBefore(
  context: StateBuffer,
  index: number
): boolean {
  if (context.head === null) {
    throw new Error('Head was unexpectedly null');
  }
  return index <= context.head;
}
