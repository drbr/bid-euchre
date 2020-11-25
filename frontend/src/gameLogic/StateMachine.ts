import { assign, Machine } from 'xstate';

type StateMachineContext = { count: number };

export const EuchreStateMachine = Machine<StateMachineContext>({
  id: 'foo bar',
  initial: 'inactive',
  context: {
    count: 0,
  },
  states: {
    inactive: {
      on: { TOGGLE: 'active' },
    },
    active: {
      entry: assign({ count: (ctx) => ctx.count + 1 }),
      on: { TOGGLE: 'inactive', GO_FORTH: 'extraState' },
    },
    extraState: {
      on: { RESET: 'inactive' },
    },
  },
});
