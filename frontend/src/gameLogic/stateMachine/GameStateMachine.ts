import { ActionFunctionMap, assign, Machine, StateNodeConfig } from 'xstate';
import {
  GameContext,
  GameEvent,
  GameMeta,
  GameStateSchema,
} from './GameStateTypes';
import { RoundStates } from './RoundStateMachine';
import { RoundContext } from './RoundStateTypes';
import { TypedStateSchema } from './TypedStateInterfaces';

const initialGameContext: GameContext = {
  score: {
    eastwest: 0,
    northsouth: 0,
  },
  events: [],
};

const GameActions: ActionFunctionMap<GameContext, GameEvent> = {
  addEventToContext: assign({
    events: (context, event) => context.events.concat(event),
  }),
};

export const GameStateMachine = Machine<
  GameContext,
  GameStateSchema,
  GameEvent
>(
  {
    id: 'EuchreStateMachine',
    type: 'parallel',
    strict: true,
    context: initialGameContext,
    states: {
      runGame: {
        id: 'runGame',
        initial: 'setup',
        states: {
          setup: {
            on: { NEXT: 'round' },
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
      recordEvents: {
        on: {
          '*': {
            actions: 'addEventToContext',
          },
        },
      },
    },
  },
  {
    actions: GameActions,
  }
);
