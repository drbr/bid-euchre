import { State, Typestate } from 'xstate';
import { Partnership } from '../../../../functions/apiContract/database/GameState';
import { TypedStateSchema } from './TypedStateInterfaces';

export type GameContext = {
  score: Record<Partnership, number>;
  eventCount: number;
};

export type GameMeta = unknown;

export type GameStateSchema = {
  states: {
    runGame: {
      states: {
        setup: TypedStateSchema<GameMeta, GameContext>;
        gotBidFromSetup: TypedStateSchema<GameMeta, GameContext>;
        round: TypedStateSchema<GameMeta, GameContext>;
      };
    };
    recordEvents: TypedStateSchema<GameMeta, GameContext>;
  };
};

export type GameEvent = { type: 'NEXT' };

export type GameState = State<
  GameContext,
  GameEvent,
  GameStateSchema,
  Typestate<GameContext>
>;
