import { Machine, StateNodeConfig } from 'xstate';
import { BiddingContext } from './BiddingStateTypes';
import {
  GameContext,
  GameEvent,
  GameMeta,
  GameStateSchema,
} from './GameStateTypes';
import { RoundStates } from './RoundStateMachine';
import { RoundContext } from './RoundStateTypes';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';

export type AllContext = GameContext & RoundContext & BiddingContext;

const initialGameContext: GameContext = {
  score: {
    eastwest: 0,
    northsouth: 0,
  },
  eventCount: 0,
  previousEventCount: null,
};

// const GameActions: ActionFunctionMap<GameContext, GameEvent> = {
//   addEventToContext: assign({
//     eventCount: (context) => context.eventCount + 1,
//   }),
// };

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
        initial: 'entry',
        states: {
          entry: {
            always: { target: 'round' },
          },
          round: {
            ...(RoundStates as StateNodeConfig<
              GameContext,
              TypedStateSchema<GameMeta, RoundContext>,
              GameEvent
            >),
          },
          gameComplete: { type: 'final' },
        },
      },
      // recordEvents: {
      //   on: {
      //     '*': {
      //       actions: 'addEventToContext',
      //     },
      //   },
      // },
    },
  }
  // {
  //   actions: GameActions,
  // }
);
