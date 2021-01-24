import * as _ from 'lodash';
import './CustomMatchers';
import { ActionObject, AnyEventObject, StateValue } from 'xstate';
import { SendGameEventErrorDetail } from '../gameLogic/apiContract/cloudFunctions/SendGameEvent';
import { createBufferStateMachine } from '../playGame/BufferMachine';
import {
  BlockType,
  BufferEvent,
  BufferMachineState,
  LINGER_DELAY_MS,
  RecvSnapshotEvent,
  SnapshotWithBlockingInfo,
  StateBuffer,
} from '../playGame/BufferMachineTypes';

const BufferMachine = createBufferStateMachine<string>();

function getStartStateWithHead(head: number, stateValue?: StateValue) {
  return getStartState({
    currentIndexShowing: null,
    head,
    gameStateSnapshots: [],
  });
}

function getStartState(
  context: StateBuffer<string>,
  stateValue?: StateValue
): BufferMachineState<string> {
  return BufferMachine.getInitialState(
    stateValue ?? BufferMachine.initialState.value,
    context
  );
}

function recvSnapshot(
  index: number,
  blockType: BlockType
): BufferEvent<string> {
  return {
    type: 'RECV_SNAPSHOT',
    snapshot: 'Snapshot ' + index,
    index: index,
    blockType: blockType,
  };
}

type StateBufferWithOptionalBlockingInfo<S> = Omit<
  StateBuffer<S>,
  'gameStateSnapshots'
> & {
  gameStateSnapshots: ReadonlyArray<
    Partial<SnapshotWithBlockingInfo<S>> | undefined
  >;
};

type EventWithExpectedContext = {
  event: BufferEvent<string>;
  expectedContext?: StateBufferWithOptionalBlockingInfo<string>;
  expectValueToMatch?: StateValue;
  expectValueNotToMatch?: StateValue;
  expectAnyActions?: boolean;
  expectActions?: ActionObject<StateBuffer<string>, BufferEvent<string>>[];
};

function applyTransitions(
  startingState: BufferMachineState<string>,
  ...transitions: EventWithExpectedContext[]
): BufferMachineState<string> {
  let current = startingState;
  for (const t of transitions) {
    current = BufferMachine.transition(current, t.event);

    if (t.expectValueToMatch) {
      expect(current).toMatchState(t.expectValueToMatch);
    }
    if (t.expectValueNotToMatch) {
      expect(current).not.toMatchState(t.expectValueNotToMatch);
    }

    if (t.expectedContext) {
      expect(current.context).toEqual(t.expectedContext);
    }

    if (t.expectAnyActions === true) {
      expect(current.actions).not.toHaveLength(0);
    } else if (t.expectAnyActions === false) {
      expect(current.actions).toHaveLength(0);
    }
    if (t.expectActions) {
      expect(current.actions).toHaveLength(t.expectActions.length);
      expect(current.actions).toMatchObject(t.expectActions);
    }
  }
  return current;
}

const BLOCKED = { loaded: { showHead: 'blocked' } };
const UNBLOCKED = { loaded: { showHead: 'unblocked' } };
const DETACHED = { loaded: 'showSnapshotDetached' };
const SENDING = 'sendingGameEvent';

const action_callApi_start = {
  type: 'xstate.start',
  activity: {
    type: 'xstate.invoke',
    src: 'sendGameEvent',
  },
};

const action_callApi_stop = {
  type: 'xstate.stop',
  activity: {
    type: 'xstate.invoke',
    src: 'sendGameEvent',
  },
};

const action_uiAlert = {
  type: 'uiAlert',
};

const action_delayedUnblock = {
  type: 'xstate.send',
  id: 'UNBLOCK_HEAD',
  event: { type: 'UNBLOCK_HEAD' },
  delay: LINGER_DELAY_MS,
};

function makeSnapshotsWithoutBlockingInfo(
  loadedIndexes: number[]
): ReadonlyArray<Partial<SnapshotWithBlockingInfo<string>>> {
  const snapshots = [];
  for (const i of loadedIndexes) {
    snapshots[i] = { snapshot: `Snapshot ${i}` };
  }
  return snapshots;
}

function makeSnapshotsWithBlockingInfo(
  loadedSnapshots: {
    index: number;
    block: BlockType;
  }[]
): ReadonlyArray<SnapshotWithBlockingInfo<string>> {
  const snapshots = [];
  for (const s of loadedSnapshots) {
    snapshots[s.index] = { snapshot: `Snapshot ${s.index}`, block: s.block };
  }
  return snapshots;
}

function contextShowingHeadAt(
  index: number,
  opts?: { loadedSnapshotIndexes?: number[] }
): StateBufferWithOptionalBlockingInfo<string> {
  const gameStateSnapshots = makeSnapshotsWithoutBlockingInfo(
    opts?.loadedSnapshotIndexes ?? _.range(1, index + 1)
  );

  return {
    currentIndexShowing: index,
    head: index,
    gameStateSnapshots,
  };
}

/* eslint jest/expect-expect: ["warn", { "assertFunctionNames": ["expect", "applyTransitions"] }] */
describe('BufferMachine', () => {
  describe('Initial state', () => {
    test('Starts in the loading state', () => {
      const initial = BufferMachine.initialState;
      expect(initial.value).toBe('loading');
    });

    test('does not respond to any events besides RECV_NEXT_STATE and RESET', () => {
      const initial = BufferMachine.initialState;
      expect(initial.nextEvents).toEqual(['RECV_SNAPSHOT', 'RESET', '']);
    });

    test('transitions only when all the states up through the head are loaded', () => {
      const start = getStartStateWithHead(2);

      applyTransitions(
        start,
        {
          event: recvSnapshot(2, 'linger'),
          expectedContext: {
            currentIndexShowing: null,
            head: 2,
            gameStateSnapshots: [
              undefined,
              undefined,
              { snapshot: 'Snapshot 2' },
            ],
          },
          expectValueToMatch: 'loading',
        },
        {
          event: recvSnapshot(1, 'linger'),
          expectedContext: contextShowingHeadAt(2),
          expectValueNotToMatch: 'loading',
        }
      );
    });

    test('does not transition if head is not defined', () => {
      const start = BufferMachine.initialState;
      expect(start.context.head).toBe(null);
      applyTransitions(
        start,
        { event: recvSnapshot(1, 'linger') },
        { event: recvSnapshot(2, 'linger') },
        {
          event: recvSnapshot(3, 'linger'),
          expectValueToMatch: 'loading',
        }
      );
    });
  });

  describe('Head mode', () => {
    test('starts showing the head state in "blocked" for a blocking state', () => {
      applyTransitions(getStartStateWithHead(1), {
        event: recvSnapshot(1, 'block'),
        expectValueToMatch: BLOCKED,
        expectAnyActions: false,
      });
    });

    test('starts showing the head state in "BLOCKED" for a lingering state, with a delayed unblock action', () => {
      applyTransitions(getStartStateWithHead(1), {
        event: recvSnapshot(1, 'linger'),
        expectValueToMatch: BLOCKED,
        expectActions: [action_delayedUnblock],
      });
    });

    const state_showHeadAt1 = applyTransitions(getStartStateWithHead(1), {
      event: recvSnapshot(1, 'block'),
    });

    test('when unblocking, transitions to "unblocked" if the next index is not available', () => {
      applyTransitions(state_showHeadAt1, {
        event: { type: 'UNBLOCK_HEAD' },
        expectedContext: contextShowingHeadAt(1),
        expectValueToMatch: UNBLOCKED,
      });
    });

    test('when unblocking, immediately advances the head if the next (lingering) index is available', () => {
      applyTransitions(
        state_showHeadAt1,
        {
          event: recvSnapshot(2, 'linger'),
          expectedContext: contextShowingHeadAt(1, {
            loadedSnapshotIndexes: [1, 2],
          }),
          expectValueToMatch: BLOCKED,
        },
        {
          event: { type: 'UNBLOCK_HEAD' },
          expectedContext: contextShowingHeadAt(2),
          expectValueToMatch: BLOCKED,
          expectActions: [action_delayedUnblock],
        }
      );
    });

    test('when unblocking, immediately advances the head if the next (blocking) index is available', () => {
      applyTransitions(
        state_showHeadAt1,
        {
          event: recvSnapshot(2, 'block'),
          expectedContext: contextShowingHeadAt(1, {
            loadedSnapshotIndexes: [1, 2],
          }),
          expectValueToMatch: BLOCKED,
        },
        {
          event: { type: 'UNBLOCK_HEAD' },
          expectedContext: contextShowingHeadAt(2),
          expectValueToMatch: BLOCKED,
          expectAnyActions: false,
        }
      );
    });

    test(`from "unblocked", on RECV, transitions to the next lingering head if it's available`, () => {
      applyTransitions(
        state_showHeadAt1,
        { event: { type: 'UNBLOCK_HEAD' } },
        {
          event: recvSnapshot(2, 'linger'),
          expectedContext: contextShowingHeadAt(2),
          expectValueToMatch: BLOCKED,
          expectActions: [action_delayedUnblock],
        }
      );
    });

    test(`from "unblocked", on RECV, transitions to the next blocking head if it's available`, () => {
      applyTransitions(
        state_showHeadAt1,
        { event: { type: 'UNBLOCK_HEAD' } },
        {
          event: recvSnapshot(2, 'block'),
          expectedContext: contextShowingHeadAt(2),
          expectValueToMatch: BLOCKED,
          expectAnyActions: false,
        }
      );
    });

    test('from "unblocked", on RECV, stays put if the next head is not available', () => {
      applyTransitions(
        state_showHeadAt1,
        { event: { type: 'UNBLOCK_HEAD' } },
        {
          event: recvSnapshot(3, 'linger'),
          expectedContext: contextShowingHeadAt(1, {
            loadedSnapshotIndexes: [1, 3],
          }),
          expectValueToMatch: UNBLOCKED,
        }
      );
    });

    test('waits to transition if future snapshots arrive out of order', () => {
      applyTransitions(
        state_showHeadAt1,
        { event: { type: 'UNBLOCK_HEAD' } },
        { event: recvSnapshot(3, 'linger') },
        {
          event: recvSnapshot(2, 'linger'),
          expectedContext: contextShowingHeadAt(2, {
            loadedSnapshotIndexes: [1, 2, 3],
          }),
          expectValueToMatch: BLOCKED,
        },
        {
          event: { type: 'UNBLOCK_HEAD' },
          expectedContext: contextShowingHeadAt(3),
          expectValueToMatch: BLOCKED,
        }
      );
    });

    test('on RESET, goes back to loading and clears the context', () => {
      applyTransitions(state_showHeadAt1, {
        event: { type: 'RESET' },
        expectedContext: BufferMachine.initialState.context,
        expectValueToMatch: 'loading',
      });
    });
  });

  describe('Detached mode', () => {
    const loadedSnapshotsThrough4 = makeSnapshotsWithBlockingInfo([
      { index: 1, block: 'block' },
      { index: 2, block: 'block' },
      { index: 3, block: 'block' },
      { index: 4, block: 'block' },
    ]);

    const state_showHeadAt4Blocked = getStartState(
      {
        head: 4,
        currentIndexShowing: 4,
        gameStateSnapshots: loadedSnapshotsThrough4,
      },
      BLOCKED
    );

    const state_showHeadAt4Unblocked = getStartState(
      {
        head: 4,
        currentIndexShowing: 4,
        gameStateSnapshots: loadedSnapshotsThrough4,
      },
      UNBLOCKED
    );

    const state_detachedAt3_headIs4 = applyTransitions(
      state_showHeadAt4Unblocked,
      {
        event: { type: 'DETACHED_GO_BACK' },
      }
    );

    function contextShowingDetachedIndex(index: number): StateBuffer<string> {
      return {
        currentIndexShowing: index,
        head: 4,
        gameStateSnapshots: loadedSnapshotsThrough4,
      };
    }

    describe('stepping back and forward', () => {
      test('can step backward and forward through the older states', () => {
        applyTransitions(
          state_showHeadAt4Unblocked,
          {
            event: { type: 'DETACHED_GO_BACK' },
            expectedContext: contextShowingDetachedIndex(3),
            expectValueToMatch: DETACHED,
          },
          {
            event: { type: 'DETACHED_GO_BACK' },
            expectedContext: contextShowingDetachedIndex(2),
            expectValueToMatch: DETACHED,
          },
          {
            event: { type: 'DETACHED_GO_FORWARD' },
            expectedContext: contextShowingDetachedIndex(3),
            expectValueToMatch: DETACHED,
          }
        );
      });

      test('stepping forward into the head state should go back into unblocked head mode', () => {
        applyTransitions(state_detachedAt3_headIs4, {
          event: { type: 'DETACHED_GO_FORWARD' },
          expectedContext: contextShowingHeadAt(4),
          expectValueToMatch: UNBLOCKED,
        });
      });

      test(
        'stepping forward from the head state should have no effect, ' +
          'even if another state is available',
        () => {
          applyTransitions(state_showHeadAt4Unblocked, {
            event: { type: 'DETACHED_GO_FORWARD' },
            expectedContext: contextShowingHeadAt(4),
            expectValueToMatch: UNBLOCKED,
          });
        }
      );

      test('stepping backward from 1 should have no effect (there is no index 0)', () => {
        applyTransitions(
          state_detachedAt3_headIs4,
          {
            event: { type: 'DETACHED_GO_TO_INDEX', index: 1 },
            expectedContext: contextShowingDetachedIndex(1),
            expectValueToMatch: DETACHED,
          },
          {
            event: { type: 'DETACHED_GO_BACK' },
            expectedContext: contextShowingDetachedIndex(1),
            expectValueToMatch: DETACHED,
          }
        );
      });
    });

    describe('jumping to a given index from head mode', () => {
      test('from "blocked", can jump to an index < head', () => {
        applyTransitions(state_showHeadAt4Blocked, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: 2 },
          expectedContext: contextShowingDetachedIndex(2),
          expectValueToMatch: DETACHED,
        });
      });

      test('from "unblocked", can jump to an index < head', () => {
        applyTransitions(state_showHeadAt4Unblocked, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: 2 },
          expectedContext: contextShowingDetachedIndex(2),
          expectValueToMatch: DETACHED,
        });
      });

      test('from "blocked", jumping to the head index goes to "unblocked"', () => {
        // We really don't care too much about this case; it's just as acceptible to stay in BLOCKED
        // if that makes for simpler code
        applyTransitions(state_showHeadAt4Blocked, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: 4 },
          expectedContext: contextShowingHeadAt(4),
          expectValueToMatch: UNBLOCKED,
        });
      });

      test('from "unblocked", jumping to the head index stays in "unblocked"', () => {
        applyTransitions(state_showHeadAt4Unblocked, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: 4 },
          expectedContext: contextShowingHeadAt(4),
          expectValueToMatch: UNBLOCKED,
        });
      });

      test("jumping to an index > head that hasn't been fetched should have no effect", () => {
        applyTransitions(state_showHeadAt4Unblocked, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: 5 },
          expectedContext: state_showHeadAt4Unblocked.context,
          expectValueToMatch: state_showHeadAt4Unblocked.value,
        });
      });

      test('jumping to an index > head that has already been fetched should have no effect', () => {
        applyTransitions(
          state_showHeadAt4Unblocked,
          { event: recvSnapshot(6, 'linger') },
          {
            event: { type: 'DETACHED_GO_TO_INDEX', index: 6 },
            expectedContext: {
              ...state_showHeadAt4Unblocked.context,
              gameStateSnapshots: makeSnapshotsWithoutBlockingInfo([
                1,
                2,
                3,
                4,
                6,
              ]),
            },
            expectValueToMatch: state_showHeadAt4Unblocked.value,
          }
        );
      });

      test('jumping to an index < 1 should have no effect', () => {
        applyTransitions(state_showHeadAt4Unblocked, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: 0 },
          expectedContext: state_showHeadAt4Blocked.context,
          expectValueToMatch: state_showHeadAt4Unblocked.value,
        });
        applyTransitions(state_showHeadAt4Unblocked, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: -1 },
          expectedContext: state_showHeadAt4Blocked.context,
          expectValueToMatch: state_showHeadAt4Unblocked.value,
        });
      });
    });

    describe('jumping to a given index from detached mode', () => {
      test('can jump to an index < head', () => {
        applyTransitions(state_detachedAt3_headIs4, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: 1 },
          expectedContext: contextShowingDetachedIndex(1),
          expectValueToMatch: DETACHED,
        });
      });

      test('jumping to the head index goes back to "unblocked"', () => {
        applyTransitions(state_detachedAt3_headIs4, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: 4 },
          expectedContext: contextShowingHeadAt(4),
          expectValueToMatch: UNBLOCKED,
        });
      });

      test("jumping to an index > head that hasn't been fetched should have no effect", () => {
        applyTransitions(state_detachedAt3_headIs4, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: 5 },
          expectedContext: state_detachedAt3_headIs4.context,
          expectValueToMatch: state_detachedAt3_headIs4.value,
        });
      });

      test('jumping to an index > head that has already been fetched should have no effect', () => {
        applyTransitions(
          state_detachedAt3_headIs4,
          { event: recvSnapshot(6, 'linger') },
          {
            event: { type: 'DETACHED_GO_TO_INDEX', index: 6 },
            expectedContext: {
              ...state_detachedAt3_headIs4.context,
              gameStateSnapshots: makeSnapshotsWithoutBlockingInfo([
                1,
                2,
                3,
                4,
                6,
              ]),
            },
            expectValueToMatch: state_detachedAt3_headIs4.value,
          }
        );
      });

      test('jumping to an index < 1 should have no effect', () => {
        applyTransitions(state_detachedAt3_headIs4, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: 0 },
          expectedContext: state_detachedAt3_headIs4.context,
          expectValueToMatch: state_detachedAt3_headIs4.value,
        });
        applyTransitions(state_detachedAt3_headIs4, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: -1 },
          expectedContext: state_detachedAt3_headIs4.context,
          expectValueToMatch: state_detachedAt3_headIs4.value,
        });
      });
    });

    test('on RECV, the current shown index and head should not change', () => {
      applyTransitions(state_detachedAt3_headIs4, {
        event: recvSnapshot(5, 'linger'),
        expectedContext: {
          ...state_detachedAt3_headIs4.context,
          gameStateSnapshots: makeSnapshotsWithoutBlockingInfo([1, 2, 3, 4, 5]),
        },
        expectValueToMatch: DETACHED,
      });
    });

    test('on RESET, goes back to loading and clears the context', () => {
      applyTransitions(state_detachedAt3_headIs4, {
        event: { type: 'RESET' },
        expectedContext: BufferMachine.initialState.context,
        expectValueToMatch: 'loading',
      });
    });
  });

  describe('Sending game events', () => {
    const event_sendGameEvent: BufferEvent<unknown> = {
      type: 'SEND_GAME_EVENT_TO_SERVER',
      gameEvent: { type: 'FakeGameEvent', value: 1 },
    };

    const event_sendGameEventSucceeded = ({
      type: 'done.invoke.sendGameEvent',
    } as AnyEventObject) as BufferEvent<string>;

    function event_sendGameEventFailed(reason?: SendGameEventErrorDetail) {
      return ({
        type: 'error.platform.sendGameEvent',
        data: reason ? { details: reason } : undefined,
      } as AnyEventObject) as BufferEvent<string>;
    }

    const state_showHeadAt2 = applyTransitions(
      getStartStateWithHead(1),
      { event: recvSnapshot(1, 'linger') },
      { event: { type: 'UNBLOCK_HEAD' } },
      { event: recvSnapshot(2, 'linger') }
    );

    test('accepts an event while displaying the head and transitions to the "busy" state', () => {
      applyTransitions(state_showHeadAt2, {
        event: event_sendGameEvent,
        expectedContext: contextShowingHeadAt(2),
        expectValueToMatch: SENDING,
        expectActions: [action_callApi_start],
      });
    });

    const state_sendingEventFrom2 = applyTransitions(state_showHeadAt2, {
      event: event_sendGameEvent,
    });

    test('does not accept events while in detached mode', () => {
      const detachedContext: StateBuffer<string> = {
        head: 2,
        currentIndexShowing: 1,
        gameStateSnapshots: makeSnapshotsWithBlockingInfo([
          { index: 1, block: 'block' },
          { index: 2, block: 'block' },
        ]),
      };

      applyTransitions(
        state_showHeadAt2,
        {
          event: { type: 'DETACHED_GO_BACK' },
          expectedContext: detachedContext,
          expectValueToMatch: DETACHED,
        },
        {
          event: event_sendGameEvent,
          expectedContext: detachedContext,
          expectValueToMatch: DETACHED,
        }
      );
    });

    test(
      'if an event update promise resolves before state n+1 arrives,' +
        'should not leave the busy state until the head can advance',
      () => {
        applyTransitions(
          state_sendingEventFrom2,
          {
            event: event_sendGameEventSucceeded,
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(2),
            expectActions: [action_callApi_stop],
          },
          {
            event: recvSnapshot(3, 'linger'),
            expectValueToMatch: BLOCKED, // Don't jump to unblocked as we do in the error cases
            expectedContext: contextShowingHeadAt(3),
            expectActions: [action_delayedUnblock],
          }
        );
      }
    );

    test(
      'if state n+1 arrives while an event update is in progress, ' +
        'should not advance the head until the update promise resolves',
      () => {
        applyTransitions(
          state_sendingEventFrom2,
          {
            event: recvSnapshot(3, 'linger'),
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(2, {
              loadedSnapshotIndexes: [1, 2, 3],
            }),
            expectAnyActions: false,
          },
          {
            event: event_sendGameEventSucceeded,
            expectValueToMatch: BLOCKED, // Don't jump to unblocked as we do in the error cases
            expectedContext: contextShowingHeadAt(3),
            expectActions: [action_callApi_stop, action_delayedUnblock],
          }
        );
      }
    );

    test(
      'if state n+2 arrives while an event update is in progress, ' +
        'should advance the head one at a time after the promise resolves',
      () => {
        applyTransitions(
          state_sendingEventFrom2,
          {
            event: recvSnapshot(3, 'linger'),
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(2, {
              loadedSnapshotIndexes: [1, 2, 3],
            }),
            expectAnyActions: false,
          },
          {
            event: recvSnapshot(4, 'linger'),
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(2, {
              loadedSnapshotIndexes: [1, 2, 3, 4],
            }),
            expectAnyActions: false,
          },
          {
            event: event_sendGameEventSucceeded,
            expectValueToMatch: BLOCKED, // Don't jump to unblocked as we do in the error cases
            expectedContext: contextShowingHeadAt(3, {
              loadedSnapshotIndexes: [1, 2, 3, 4],
            }),
            expectActions: [action_callApi_stop, action_delayedUnblock],
          }
        );
      }
    );

    test(
      'if the event update fails because of stale state and the next state is already received, ' +
        'should advance the head and try sending the event again, while staying in the busy state',
      () => {
        applyTransitions(
          state_sendingEventFrom2,
          {
            event: recvSnapshot(3, 'linger'),
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(2, {
              loadedSnapshotIndexes: [1, 2, 3],
            }),
            expectAnyActions: false,
          },
          {
            event: event_sendGameEventFailed(
              SendGameEventErrorDetail.StaleState
            ),
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(3),
            expectActions: [action_callApi_stop, action_callApi_start],
          }
        );
      }
    );

    test(
      'if the event update fails because of stale state and multiple next states are already received, ' +
        'should advance the head all the way and try sending the event again, while staying in the busy state',
      () => {
        applyTransitions(
          state_sendingEventFrom2,
          {
            event: recvSnapshot(3, 'linger'),
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(2, {
              loadedSnapshotIndexes: [1, 2, 3],
            }),
            expectAnyActions: false,
          },
          {
            event: recvSnapshot(4, 'linger'),
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(2, {
              loadedSnapshotIndexes: [1, 2, 3, 4],
            }),
            expectAnyActions: false,
          },
          {
            event: event_sendGameEventFailed(
              SendGameEventErrorDetail.StaleState
            ),
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(4),
            expectActions: [action_callApi_stop, action_callApi_start],
          }
        );
      }
    );

    test(
      'if the event update fails because of stale state and the next head is not yet received, ' +
        'should wait until the next head is available, then advance and try sending again',
      () => {
        applyTransitions(
          state_sendingEventFrom2,
          {
            event: event_sendGameEventFailed(
              SendGameEventErrorDetail.StaleState
            ),
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(2),
            expectActions: [action_callApi_stop],
          },
          {
            event: recvSnapshot(3, 'linger'),
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(3),
            expectActions: [action_callApi_start],
          }
        );
      }
    );

    test(
      'if the event update fails because the transition was not accepted, leave the busy state ' +
        'and go back to *unblocked* head mode',
      () => {
        applyTransitions(state_sendingEventFrom2, {
          event: event_sendGameEventFailed(
            SendGameEventErrorDetail.InvalidStateTransition
          ),
          expectValueToMatch: UNBLOCKED,
          expectedContext: contextShowingHeadAt(2),
          expectActions: [action_callApi_stop, action_uiAlert],
        });
      }
    );

    test(
      'if the event update fails because the transition was not accepted but the next state arrived ' +
        'in the meantime, go to *unblocked* head mode for the most recent snapshot',
      () => {
        applyTransitions(
          state_sendingEventFrom2,
          {
            event: recvSnapshot(3, 'linger'),
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(2, {
              loadedSnapshotIndexes: [1, 2, 3],
            }),
            expectAnyActions: false,
          },
          {
            event: event_sendGameEventFailed(
              SendGameEventErrorDetail.InvalidStateTransition
            ),
            expectValueToMatch: UNBLOCKED,
            expectedContext: contextShowingHeadAt(3),
            expectActions: [action_callApi_stop, action_uiAlert],
          }
        );
      }
    );

    test(
      'if the event update fails for an unknown reason, leave the busy state ' +
        'and go back to *unblocked* head mode',
      () => {
        applyTransitions(state_sendingEventFrom2, {
          event: event_sendGameEventFailed(),
          expectValueToMatch: UNBLOCKED,
          expectedContext: contextShowingHeadAt(2),
          expectActions: [action_callApi_stop, action_uiAlert],
        });
      }
    );

    test(
      'if the event update fails for an unknown reason but multiple next states arrived in the meantime, ' +
        'go to *unblocked* head mode for the most recent snapshot',
      () => {
        applyTransitions(
          state_sendingEventFrom2,
          {
            event: recvSnapshot(3, 'linger'),
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(2, {
              loadedSnapshotIndexes: [1, 2, 3],
            }),
            expectAnyActions: false,
          },
          {
            event: recvSnapshot(4, 'linger'),
            expectValueToMatch: SENDING,
            expectedContext: contextShowingHeadAt(2, {
              loadedSnapshotIndexes: [1, 2, 3, 4],
            }),
            expectAnyActions: false,
          },
          {
            event: event_sendGameEventFailed(),
            expectValueToMatch: UNBLOCKED,
            expectedContext: contextShowingHeadAt(4),
            expectActions: [action_callApi_stop, action_uiAlert],
          }
        );
      }
    );
  });
});
