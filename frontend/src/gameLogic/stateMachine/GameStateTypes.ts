import { Partnership } from '../../../../functions/apiContract/database/GameState';
import { TypedStateSchema } from './TypedStateInterfaces';

export type GameContext = {
  score: Record<Partnership, number>;
};

export type GameMeta = unknown;

export type GameStateSchema = {
  states: {
    setup: TypedStateSchema<GameMeta, GameContext>;
    round: TypedStateSchema<GameMeta, GameContext>;
  };
};

export type GameEvent = { type: 'NEXT' };
