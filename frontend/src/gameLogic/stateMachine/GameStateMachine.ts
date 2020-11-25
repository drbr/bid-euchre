import { assign, Machine, StateNodeConfig } from 'xstate';
import {
  GameContext,
  GameEvent,
  GameMeta,
  GameStateSchema,
} from './GameStateTypes';
import { RoundStates } from './RoundStateMachine.ts';
import { RoundContext } from './RoundStateTypes';
import { TypedStateSchema } from './TypedStateInterfaces';

type SubmachineContext = { countValue: number };
type SubmachineStateSchema = {
  states: {
    count: TypedStateSchema<unknown, SubmachineContext>;
    check: TypedStateSchema<unknown, SubmachineContext>;
    arrived: TypedStateSchema<unknown, SubmachineContext>;
  };
};

type SubmachineEvent = { type: 'poke' };

const submachine = Machine<
  SubmachineContext,
  SubmachineStateSchema,
  SubmachineEvent
>(
  {
    id: 'subMachine',
    initial: 'count',
    context: { countValue: 0 },
    states: {
      count: {
        on: {
          poke: {
            target: 'check',
            actions: assign({
              countValue: (context) => context.countValue + 1,
            }),
          },
        },
      },
      check: {
        always: [
          {
            target: 'arrived',
            cond: 'reachedTarget',
          },
          {
            target: 'count',
          },
        ],
      },
      arrived: { type: 'final' },
    },
  },
  {
    guards: {
      reachedTarget: (context) => context.countValue === 3,
    },
  }
);

const initialGameContext: GameContext = {
  score: {
    eastwest: 0,
    northsouth: 0,
  },
};

export const GameStateMachine = Machine<
  GameContext,
  GameStateSchema,
  GameEvent
>(
  {
    id: 'EuchreGame',
    initial: 'setup',
    context: initialGameContext,
    states: {
      setup: {
        // on: { NEXT: 'round' },
        invoke: { src: 'submachine', autoForward: true },
        onDone: { target: 'round' },
      },

      round: {
        on: { NEXT: 'round' },
        ...(RoundStates as StateNodeConfig<
          GameContext,
          TypedStateSchema<GameMeta, RoundContext>,
          GameEvent
        >),
      },
    },
  },
  {
    services: {
      submachine,
    },
  }
);
