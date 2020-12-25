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
    test('starts showing the head state in "blocked"', () => {
      applyTransitions(getStartStateWithHead(1), {
        event: recvSnapshot(1),
        expectValueToEqual: { loaded: 'showHeadBlocking' },
      });
    });

    test('when unblocking, transitions to "unblocked" if the next index is not available', () => {
      applyTransitions(
        getStartStateWithHead(1),
        { event: recvSnapshot(1) },
        {
          event: { type: 'UNBLOCK_HEAD' },
          expectedContext: contextShowingHeadAt(1),
          expectValueToEqual: { loaded: 'showHeadUnblocked' },
        }
      );
    });

    test('when unblocking, immediately advances the head if the next index is available', () => {
      applyTransitions(
        getStartStateWithHead(1),
        { event: recvSnapshot(1) },
        {
          event: recvSnapshot(2),
          expectedContext: contextShowingHeadAt(1, {
            loadedSnapshotIndexes: [1, 2],
          }),
          expectValueToEqual: { loaded: 'showHeadBlocking' },
        },
        {
          event: { type: 'UNBLOCK_HEAD' },
          expectedContext: contextShowingHeadAt(2),
          expectValueToEqual: { loaded: 'showHeadBlocking' },
        }
      );
    });
    // from unblock, on RECV, transitions to the next head if it's available
    // from unblock, on RECV, stays put if the next head is not available
    // from unblock, on RECV, stays put if the next head is not available, and stays put after unblock
    // from unblock, load h+2, then h+1, it should transition to h+1
    // on reset, go back to loading and clear out the context
  });

  describe('Detached mode', () => {
    // from unblocked, go back one
    // from unblocked, go back two
    // back two and forward one
    // back one and forward one, it should go back into head
    // from blocked, go to arbitrary index < head
    // from blocked, go to arbitrary index == head, stays in head blocked
    // from unblocked, go to arbitrary index == head, stays in head unblocked
    // from blocked, go to arbitrary index > head, throws
    // from detached, go to arbitrary index < head
    // from detached, go to arbitrary index == head, goes back to head mode unblocked
    // from detached, go to arbitrary index > head, throws an error
    // back one, while in detached, receive a newer snapshot, go forward one and it should go back to the original head
    // on reset, go back to loading and clear out the context
  });
});
