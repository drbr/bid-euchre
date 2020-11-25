import { Machine, MachineOptions, StateNodeConfig } from 'xstate';
import { BiddingOptions } from './BiddingStateMachine';
import {
  GameContext,
  GameEvent,
  GameMeta,
  GameStateSchema,
} from './GameStateTypes';
import { RoundStates } from './RoundStateMachine.ts';
import { RoundContext } from './RoundStateTypes';
import { TypedStateSchema } from './TypedStateInterfaces';

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
    id: 'Euchre Game',
    initial: 'setup',
    context: initialGameContext,
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
  {
    ...(BiddingOptions as Partial<MachineOptions<GameContext, GameEvent>>),
  }
);
