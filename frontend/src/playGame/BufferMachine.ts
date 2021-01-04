import {
  actions,
  assign,
  DoneInvokeEvent,
  Machine,
  MachineConfig,
  send,
  StateMachine,
  Typestate,
} from 'xstate';
import { SendGameEventErrorDetail } from '../gameLogic/apiContract/cloudFunctions/SendGameEvent';
import {
  StateBuffer,
  BufferStateSchema,
  BufferEvent,
  LINGER_DELAY_MS,
  RecvSnapshotEvent,
} from './BufferMachineTypes';

/**
 * This machine controls how the UI transitions through the game states. The state snapshots can be
 * sent to the client in quick succession, but the UI does not necessarily display them right away;
 * it might block or linger on certain states, storing the newer states in the buffer and
 * transitioning only when the appropriate user interactions have occurred.
 */
export function createBufferStateMachine<S>(): StateMachine<
  StateBuffer<S>,
  BufferStateSchema<S>,
  BufferEvent<S>,
  Typestate<StateBuffer<S>>
> {
  const initialContext: StateBuffer<S> = {
    currentIndexShowing: null,
    head: null,
    gameStateSnapshots: [],
  };

  const machineConfig: MachineConfig<
    StateBuffer<S>,
    BufferStateSchema<S>,
    BufferEvent<S>
  > = {
    id: 'BufferMachine',
    strict: true,
    initial: 'loading',
    context: initialContext,
    on: {
      RECV_SNAPSHOT: {
        actions: assign((context, event) =>
          addSnapshotToBuffer(context, event)
        ),
      },
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
        initial: 'showHead',
        on: {
          DETACHED_GO_TO_INDEX: {
            target: 'loaded.showSnapshotDetached',
            cond: (context, event) =>
              indexIsWithinDetachableRange(context, event.index),
            actions: assign({
              currentIndexShowing: (context, event) => event.index,
            }),
          },
          DETACHED_GO_FORWARD: {
            target: 'loaded.showSnapshotDetached',
            cond: (context) =>
              indexIsWithinDetachableRange(
                context,
                (context.currentIndexShowing || 0) + 1
              ),
            actions: assign({
              currentIndexShowing: (context) =>
                (context.currentIndexShowing || 0) + 1,
            }),
          },
          DETACHED_GO_BACK: {
            target: 'loaded.showSnapshotDetached',
            cond: (context) =>
              indexIsWithinDetachableRange(
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
          showHead: {
            id: 'showHead',
            initial: 'enterHead',
            on: {
              SEND_GAME_EVENT_TO_SERVER: '#sendingGameEvent.makeApiCall',
            },
            states: {
              enterHead: {
                always: [
                  {
                    cond: nextHeadLingers,
                    target: 'lingering',
                  },
                  {
                    cond: nextHeadBlocks,
                    target: 'blocked',
                  },
                  {
                    target: 'unblocked',
                  },
                ],
              },
              lingering: {
                entry: send('UNBLOCK_HEAD', { delay: LINGER_DELAY_MS }),
                always: { target: 'blocked' },
              },
              blocked: {
                on: {
                  UNBLOCK_HEAD: { target: 'unblocked' },
                },
              },
              unblocked: {
                always: {
                  cond: nextSnapshotIsAvailable,
                  target: 'enterHead',
                  actions: assign((context) => safelyAdvanceHead(context)),
                },
              },
            },
          },
          showSnapshotDetached: {
            // If we're on the head, leave detached mode
            always: {
              target: '#showHead.unblocked',
              cond: isAtHead,
            },
          },
        },
      },
      sendingGameEvent: {
        id: 'sendingGameEvent',
        initial: 'makeApiCall',
        states: {
          makeApiCall: {
            invoke: {
              id: 'sendGameEvent',
              src: 'sendGameEvent',
              onDone: {
                target: 'waitForDataToSync',
              },
              onError: [
                {
                  cond: sendEventErrorWasStaleState,
                  target: 'prepareToTrySendingAgain',
                },
                {
                  target: '#showHead.unblocked',
                  actions: [
                    assign((context) => advanceHeadToNewest(context)),
                    actions.pure((context, event) => ({
                      type: 'uiAlert',
                      error: event.data,
                      message:
                        'Could not send game event. See log for details.',
                    })),
                  ],
                },
              ],
            },
          },
          waitForDataToSync: {
            always: {
              cond: nextSnapshotIsAvailable,
              target: '#showHead',
              actions: assign((context) => safelyAdvanceHead(context)),
            },
          },
          prepareToTrySendingAgain: {
            always: {
              cond: nextSnapshotIsAvailable,
              target: 'makeApiCall',
              actions: assign((context) => advanceHeadToNewest(context)),
            },
          },
        },
      },
    },
  };

  return Machine<StateBuffer<S>, BufferStateSchema<S>, BufferEvent<S>>(
    machineConfig
  );
}

function addSnapshotToBuffer<S>(
  prevBuffer: StateBuffer<S>,
  event: RecvSnapshotEvent<S>
): StateBuffer<S> {
  if (!event.snapshot) {
    throw new Error('Tried to add a null object into the state buffer');
  }

  const clonedSnapshots = prevBuffer.gameStateSnapshots.slice(0);
  clonedSnapshots[event.index] = event.snapshot;

  return {
    ...prevBuffer,
    gameStateSnapshots: clonedSnapshots,
  };
}

function isLoadingComplete(context: StateBuffer<unknown>) {
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

function nextSnapshotIsAvailable(context: StateBuffer<unknown>): boolean {
  const { currentIndexShowing, head } = context;
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
  return !!context.gameStateSnapshots[nextIndex];
}

function nextHeadLingers<S>(
  context: StateBuffer<S>,
  event: BufferEvent<S>
): boolean {
  // Possibly in the future we will have a special action or some way to indicate
  // that the next state should not block or linger
  return true;
}

function nextHeadBlocks<S>(
  context: StateBuffer<S>,
  event: BufferEvent<S>
): boolean {
  // Possibly in the future we will have a special action or some way to indicate
  // that the next state should not block or linger
  return false;
}

function safelyAdvanceHead<S>(context: StateBuffer<S>): StateBuffer<S> {
  if (!nextSnapshotIsAvailable(context)) {
    throw new Error('Tried to advance the head, but it is not yet in buffer');
  }
  if (!context.currentIndexShowing) {
    throw new Error('currentIndexShowing was unexpectedly null');
  }
  const nextIndex = context.currentIndexShowing + 1;

  return {
    ...context,
    currentIndexShowing: nextIndex,
    head: nextIndex,
  };
}

function advanceHeadToNewest<S>(context: StateBuffer<S>): StateBuffer<S> {
  let pointer = context;
  while (nextSnapshotIsAvailable(pointer)) {
    pointer = safelyAdvanceHead(pointer);
  }
  return pointer;
}

function isAtHead(context: StateBuffer<unknown>): boolean {
  return context.currentIndexShowing === context.head;
}

function indexIsWithinDetachableRange(
  context: StateBuffer<unknown>,
  index: number
): boolean {
  if (context.head === null) {
    throw new Error('Head was unexpectedly null');
  }

  // There is no index 0
  return index <= context.head && index >= 1;
}

function sendEventErrorWasStaleState(
  context: unknown,
  event: DoneInvokeEvent<{ details: unknown } | undefined>
): boolean {
  return event?.data?.details === SendGameEventErrorDetail.StaleState;
}
