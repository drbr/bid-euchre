import { BufferStateMachine } from '../app/playGame/BufferMachine';

describe('BufferMachine', () => {
  describe('Initial state', () => {
    test('Starts in the loading state', () => {
      const initial = BufferStateMachine.initialState;
      expect(initial.value).toBe('loading');
    });

    test('does not respond to any events besides RECV_NEXT_STATE and RESET', () => {
      const initial = BufferStateMachine.initialState;
      expect(initial.nextEvents).toEqual(['RECV_NEXT_STATE', 'RESET']);
    });

    test('transitions only when all the states up to the head are loaded', () => {
      const machine = BufferStateMachine;
      const n = machine.initialState;

      machine.transition(n, {
        type: "RECV_NEXT_STATE",
        newState:
      });

    });
  });
});
