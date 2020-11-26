import { Machine, StateNodeConfig } from 'xstate';
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
};

export const GameStateMachine = Machine<
  GameContext,
  GameStateSchema,
  GameEvent
>(
  {
    id: 'EuchreStateMachine',
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
  {}
);
