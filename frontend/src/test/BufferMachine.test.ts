import {
  BufferEvent,
  BufferState,
  createBufferStateMachine,
  StateBuffer,
} from '../app/playGame/BufferMachine';

const BufferMachine = createBufferStateMachine<string>();

type EventWithExpectedContext = {
  event: BufferEvent<string>;
  expectedContext: StateBuffer<string>;
};

function getStartStateWithHead(head: number) {
  return getStartState({
    currentIndexShowing: null,
    head,
    gameStateSnapshots: [],
  });
}

function getStartState(context: StateBuffer<string>): BufferState<string> {
  return BufferMachine.getInitialState(
    BufferMachine.initialState.value,
    context
  );
}

function validateTransitions(
  startingState: BufferState<string>,
  ...transitions: EventWithExpectedContext[]
): BufferState<string> {
  let current = startingState;
  for (const t of transitions) {
    current = BufferMachine.transition(current, t.event);
    expect(current.context).toEqual(t.expectedContext);
  }
  return current;
}

/* eslint jest/expect-expect: ["warn", { "assertFunctionNames": ["expect", "validateTransitions"] }] */
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

      validateTransitions(
        start,
        {
          event: {
            type: 'RECV_SNAPSHOT',
            snapshot: 'Snapshot 2',
            index: 2,
          },
          expectedContext: {
            currentIndexShowing: null,
            head: 2,
            gameStateSnapshots: [undefined, undefined, 'Snapshot 2'],
          },
        },
        {
          event: {
            type: 'RECV_SNAPSHOT',
            snapshot: 'Snapshot 1',
            index: 1,
          },
          expectedContext: {
            currentIndexShowing: 2,
            head: 2,
            gameStateSnapshots: [undefined, 'Snapshot 1', 'Snapshot 2'],
          },
        }
      );
    });
  });
});
