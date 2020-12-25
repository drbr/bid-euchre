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
  do?: (state: BufferState<string>) => void;
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
    if (t.do) {
      t.do(current);
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
          do: (s) => expect(s.value).toEqual('loading'),
        },
        {
          event: recvSnapshot(1),
          expectedContext: {
            currentIndexShowing: 2,
            head: 2,
            gameStateSnapshots: [undefined, 'Snapshot 1', 'Snapshot 2'],
          },
          do: (s) => expect(s.value).not.toEqual('loading'),
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
          do: (s) => expect(s.value).toEqual('loading'),
        }
      );
    });
  });

  describe('Head mode', () => {
    // starts in blocked
    // from blocked, send unblock and it should stay there if next is unavailable
    // from blocked, send unblock and it should immediately transition if next is available
    // from unblock, on RECV, transitions to the next head if it's available
    // from unblock, on RECV, stays put if the next head is not available
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
  });
});
