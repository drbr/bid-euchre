import { AnyEventObject } from 'xstate';
import { Partnership } from '../../../../functions/apiContract/database/GameState';
import { TypedStateSchema } from './TypedStateInterfaces';

export type GameContext = {
  score: Record<Partnership, number>;
  events: ReadonlyArray<AnyEventObject>;
};

export type GameMeta = unknown;

export type GameStateSchema = {
  states: {
    runGame: {
      states: {
        setup: TypedStateSchema<GameMeta, GameContext>;
        round: TypedStateSchema<GameMeta, GameContext>;
      };
    };
    recordEvents: TypedStateSchema<GameMeta, GameContext>;
  };
};

export type GameEvent = { type: 'NEXT' };
