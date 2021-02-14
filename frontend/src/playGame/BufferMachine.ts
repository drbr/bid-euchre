import {
  actions,
  assign,
  DoneInvokeEvent,
  Machine,
  MachineConfig,
  StateMachine,
  Typestate,
} from 'xstate';
import { SendGameEventErrorDetail } from '../gameLogic/apiContract/cloudFunctions/SendGameEvent';
import { UIActions } from '../uiHelpers/UIActions';
import {
  StateBuffer,
  BufferStateSchema,
  BufferEvent,
  LINGER_DELAY_MS,
  RecvSnapshotEvent,
} from './BufferMachineTypes';

export const DELAYED_UNBLOCK_ID = 'delayedUnblock';
export const DELAYED_REPLAY_ADVANCE_ID = 'replayAdvance';

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
        actions: assign((context) => initialContext),
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
              SEND_GAME_EVENT_VIA_BUFFER: '#sendingGameEvent.makeApiCall',
              REPLAY_START: {
                target: 'replay',
                cond: (context, event) =>
                  indexIsWithinDetachableRange(
                    context,
                    event.replayRange.start
                  ),
                actions: assign({
                  currentIndexShowing: (context, event) =>
                    event.replayRange.start,
                  replayRange: (context, event) => event.replayRange,
                }),
              },
            },
            exit: actions.cancel(DELAYED_UNBLOCK_ID),
            states: {
              enterHead: {
                always: [
                  {
                    cond: headShouldLinger,
                    target: 'lingering',
                  },
                  {
                    cond: headShouldBlock,
                    target: 'blocked',
                  },
                  {
                    target: 'unblocked',
                  },
                ],
              },
              lingering: {
                entry: actions.send('UNBLOCK_HEAD', {
                  delay: LINGER_DELAY_MS,
                  id: DELAYED_UNBLOCK_ID,
                }),
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
              target: 'showHead',
              cond: isAtHead,
            },
          },
          replay: {
            entry: actions.send('REPLAY_ADVANCE', {
              delay: LINGER_DELAY_MS,
              id: DELAYED_REPLAY_ADVANCE_ID,
            }),
            exit: actions.cancel(DELAYED_REPLAY_ADVANCE_ID),
            on: {
              REPLAY_ADVANCE: {
                target: 'replay',
                cond: (context) => canAdvanceReplayIndex(context),
                actions: assign({
                  currentIndexShowing: (context) =>
                    (context.currentIndexShowing || 0) + 1,
                }),
              },
              REPLAY_EXIT: {
                target: 'showHead',
                actions: assign({
                  currentIndexShowing: (context) => context.head,
                  replayRange: (context) => undefined,
                }),
              },
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
    machineConfig,
    {
      actions: {
        uiAlert: (context, event, meta) =>
          UIActions.showErrorAlert(
            ((event as unknown) as DoneInvokeEvent<unknown>).data,
            {
              message: meta.action.message,
            }
          ),
      },
    }
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
  clonedSnapshots[event.index] = {
    snapshot: event.snapshot,
    blockType: event.blockType,
  };

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

function getHeadSnapshot(context: StateBuffer<unknown>) {
  if (!context.head) {
    return null;
  }
  const snapshotInfo = context.gameStateSnapshots[context.head];
  return snapshotInfo ?? null;
}

function headShouldLinger(context: StateBuffer<unknown>): boolean {
  const headSnapshot = getHeadSnapshot(context);
  return headSnapshot?.blockType === 'linger';
}

export function headShouldBlock(context: StateBuffer<unknown>): boolean {
  const headSnapshot = getHeadSnapshot(context);
  return headSnapshot?.blockType === 'block';
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
  nextIndex: number
): boolean {
  if (context.head === null) {
    throw new Error('Head was unexpectedly null');
  }

  // There is no index 0
  return nextIndex <= context.head && nextIndex >= 1;
}

function canAdvanceReplayIndex(context: StateBuffer<unknown>): boolean {
  const nextIndex = (context.currentIndexShowing ?? 0) + 1;

  if (!context.replayRange) {
    throw new Error(
      'Cannot advance replay index; no replay range set in the buffer machine'
    );
  }

  const withinDetachableRange = indexIsWithinDetachableRange(
    context,
    nextIndex
  );
  const withinReplayRange =
    nextIndex >= context.replayRange.start &&
    nextIndex <= context.replayRange.end;
  return withinDetachableRange && withinReplayRange;
}

function sendEventErrorWasStaleState(
  context: unknown,
  event: DoneInvokeEvent<{ details: unknown } | undefined>
): boolean {
  return event?.data?.details === SendGameEventErrorDetail.StaleState;
}
