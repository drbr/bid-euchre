import { ActionFunctionMap, assign, Machine, StateNodeConfig } from 'xstate';
import { BiddingContext } from './BiddingStateTypes';
import {
  GameContext,
  GameEvent,
  GameMeta,
  GameStateSchema,
} from './GameStateTypes';
import { RoundStates } from './RoundStateMachine';
import { RoundContext } from './RoundStateTypes';
import { TypedStateSchema } from './TypedStateInterfaces';

export type AllContext = GameContext & RoundContext & BiddingContext;

const initialGameContext: GameContext = {
  score: {
    eastwest: 0,
    northsouth: 0,
  },
  eventCount: 0,
};

const GameActions: ActionFunctionMap<GameContext, GameEvent> = {
  addEventToContext: assign({
    eventCount: (context, event) => context.eventCount + 1,
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
          gotBidFromSetup: {},
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
