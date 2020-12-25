import * as _ from 'lodash';
import { StateValue } from 'xstate';
import {
  BufferEvent,
  BufferState,
  createBufferStateMachine,
  StateBuffer,
} from '../app/playGame/BufferMachine';

const BufferMachine = createBufferStateMachine<string>();

type EventWithExpectedContext = {
  event: BufferEvent<string>;
  expectedContext?: StateBuffer<string>;
  expectValueToEqual?: StateValue;
  expectValueNotToEqual?: StateValue;
};

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
): BufferState<string> {
  return BufferMachine.getInitialState(
    stateValue ?? BufferMachine.initialState.value,
    context
  );
}

function recvSnapshot(index: number): BufferEvent<string> {
  return {
    type: 'RECV_SNAPSHOT',
    snapshot: 'Snapshot ' + index,
    index: index,
  };
}

function applyTransitions(
  startingState: BufferState<string>,
  ...transitions: EventWithExpectedContext[]
): BufferState<string> {
  let current = startingState;
  for (const t of transitions) {
    current = BufferMachine.transition(current, t.event);
    if (t.expectedContext) {
      expect(current.context).toEqual(t.expectedContext);
    }
    if (t.expectValueToEqual) {
      expect(current.value).toEqual(t.expectValueToEqual);
    }
    if (t.expectValueNotToEqual) {
      expect(current.value).not.toEqual(t.expectValueNotToEqual);
    }
  }
  return current;
}

const BLOCKED = { loaded: 'showHeadBlocked' };
const UNBLOCKED = { loaded: 'showHeadUnblocked' };
const DETACHED = { loaded: 'showSnapshotDetached' };

function contextShowingHeadAt(
  index: number,
  opts?: { loadedSnapshotIndexes?: number[] }
): StateBuffer<string> {
  let gameStateSnapshots = [
    undefined,
    ..._.range(1, index + 1).map((x) => `Snapshot ${x}`),
  ];
  if (opts?.loadedSnapshotIndexes) {
    gameStateSnapshots = [];
    for (const i of opts.loadedSnapshotIndexes) {
      gameStateSnapshots[i] = `Snapshot ${i}`;
    }
  }

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

    test('transitions only when all the states up to the head are loaded', () => {
      const start = getStartStateWithHead(2);

      applyTransitions(
        start,
        {
          event: recvSnapshot(2),
          expectedContext: {
            currentIndexShowing: null,
            head: 2,
            gameStateSnapshots: [undefined, undefined, 'Snapshot 2'],
          },
          expectValueToEqual: 'loading',
        },
        {
          event: recvSnapshot(1),
          expectedContext: contextShowingHeadAt(2),
          expectValueNotToEqual: 'loading',
        }
      );
    });

    test('does not transition if head is not defined', () => {
      const start = BufferMachine.initialState;
      expect(start.context.head).toBe(null);
      applyTransitions(
        start,
        { event: recvSnapshot(1) },
        { event: recvSnapshot(2) },
        {
          event: recvSnapshot(3),
          expectValueToEqual: 'loading',
        }
      );
    });
  });

  describe('Head mode', () => {
    const state_showHeadAt1 = applyTransitions(getStartStateWithHead(1), {
      event: recvSnapshot(1),
    });

    test('starts showing the head state in "blocked"', () => {
      expect(state_showHeadAt1.value).toEqual(BLOCKED);
    });

    test('when unblocking, transitions to "unblocked" if the next index is not available', () => {
      applyTransitions(state_showHeadAt1, {
        event: { type: 'UNBLOCK_HEAD' },
        expectedContext: contextShowingHeadAt(1),
        expectValueToEqual: UNBLOCKED,
      });
    });

    test('when unblocking, immediately advances the head if the next index is available', () => {
      applyTransitions(
        state_showHeadAt1,
        {
          event: recvSnapshot(2),
          expectedContext: contextShowingHeadAt(1, {
            loadedSnapshotIndexes: [1, 2],
          }),
          expectValueToEqual: BLOCKED,
        },
        {
          event: { type: 'UNBLOCK_HEAD' },
          expectedContext: contextShowingHeadAt(2),
          expectValueToEqual: BLOCKED,
        }
      );
    });

    test(`from "unblocked", on RECV, transitions to the next head if it's available`, () => {
      applyTransitions(
        state_showHeadAt1,
        { event: { type: 'UNBLOCK_HEAD' } },
        {
          event: recvSnapshot(2),
          expectedContext: contextShowingHeadAt(2),
          expectValueToEqual: BLOCKED,
        }
      );
    });

    test('from "unblocked", on RECV, stays put if the next head is not available', () => {
      applyTransitions(
        state_showHeadAt1,
        { event: { type: 'UNBLOCK_HEAD' } },
        {
          event: recvSnapshot(3),
          expectedContext: contextShowingHeadAt(1, {
            loadedSnapshotIndexes: [1, 3],
          }),
          expectValueToEqual: UNBLOCKED,
        }
      );
    });

    test('waits to transition if future snapshots arrive out of order', () => {
      applyTransitions(
        state_showHeadAt1,
        { event: { type: 'UNBLOCK_HEAD' } },
        { event: recvSnapshot(3) },
        {
          event: recvSnapshot(2),
          expectedContext: contextShowingHeadAt(2, {
            loadedSnapshotIndexes: [1, 2, 3],
          }),
          expectValueToEqual: BLOCKED,
        },
        {
          event: { type: 'UNBLOCK_HEAD' },
          expectedContext: contextShowingHeadAt(3),
          expectValueToEqual: BLOCKED,
        }
      );
    });

    test('on RESET, goes back to loading and clears the context', () => {
      applyTransitions(state_showHeadAt1, {
        event: { type: 'RESET' },
        expectedContext: BufferMachine.initialState.context,
        expectValueToEqual: 'loading',
      });
    });
  });

  describe('Detached mode', () => {
    const loadedSnapshotsThrough4 = [
      undefined,
      'Snapshot 1',
      'Snapshot 2',
      'Snapshot 3',
      'Snapshot 4',
    ];

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

    const state_detachedAt3 = applyTransitions(state_showHeadAt4Unblocked, {
      event: { type: 'DETACHED_GO_BACK' },
    });

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
            expectValueToEqual: DETACHED,
          },
          {
            event: { type: 'DETACHED_GO_BACK' },
            expectedContext: contextShowingDetachedIndex(2),
            expectValueToEqual: DETACHED,
          },
          {
            event: { type: 'DETACHED_GO_FORWARD' },
            expectedContext: contextShowingDetachedIndex(3),
            expectValueToEqual: DETACHED,
          }
        );
      });

      test('stepping forward into the head state should go back into unblocked head mode', () => {
        applyTransitions(state_detachedAt3, {
          event: { type: 'DETACHED_GO_FORWARD' },
          expectedContext: contextShowingHeadAt(4),
          expectValueToEqual: UNBLOCKED,
        });
      });

      test(
        'stepping forward from the head state should have no effect, ' +
          'even if another state is available',
        () => {
          //
        }
      );

      test('stepping backward from 0 should have no effect', () => {
        //
      });
    });

    describe('jumping to a given index from head mode', () => {
      test('from "blocked", can jump to an index < head', () => {
        applyTransitions(state_showHeadAt4Blocked, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: 2 },
          expectedContext: contextShowingDetachedIndex(2),
          expectValueToEqual: DETACHED,
        });
      });

      test('from "unblocked", can jump to an index < head', () => {
        //
      });

      test('from "blocked", jumping to the head index stays in "blocked"', () => {
        applyTransitions(state_showHeadAt4Blocked, {
          event: { type: 'DETACHED_GO_TO_INDEX', index: 4 },
          expectedContext: contextShowingHeadAt(4),
          expectValueToEqual: BLOCKED,
        });
      });

      test('from "unblocked", jumping to the head index stays in "unblocked"', () => {});

      test('from "blocked", jumping to an index > head does what?', () => {
        //
      });

      // What if newer states exist?

      test('from "unblocked", jumping to an index > head does what?', () => {
        //
      });

      test('jumping to an index < 0 throws an error', () => {});
    });

    describe('jumping to a given index from detached mode', () => {
      // from detached, go to arbitrary index < head
      // from detached, go to arbitrary index == head, goes back to head mode unblocked
      // from detached, go to arbitrary index > head, throws an error
    });

    test('on RECV, the current shown index and head should not change', () => {
      applyTransitions(state_detachedAt3, {
        event: recvSnapshot(5),
        expectedContext: contextShowingDetachedIndex(3),
        expectValueToEqual: DETACHED,
      });
    });

    test('on RESET, goes back to loading and clears the context', () => {
      applyTransitions(state_detachedAt3, {
        event: { type: 'RESET' },
        expectedContext: BufferMachine.initialState.context,
        expectValueToEqual: 'loading',
      });
    });
  });
});
