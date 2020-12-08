import { State, Typestate } from 'xstate';
import { Partnership } from '../../../../functions/apiContract/database/GameState';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';

export type GameContext = {
  score: Record<Partnership, number>;
  eventCount: number;
  previousEventCount: number | null;
};

export type GameMeta = unknown;

export type GameStatesGeneric<T> = {
  entry: T;
  round: T;
  gameComplete: T;
};

export type GameStateNames = keyof GameStatesGeneric<unknown>;

export type GameStateSchema = {
  states: {
    runGame: {
      states: GameStatesGeneric<TypedStateSchema<GameMeta, GameContext>>;
    };
    recordEvents: TypedStateSchema<GameMeta, GameContext>;
  };
};

export type GameEvent = { type: never };

export type GameState = State<
  GameContext,
  GameEvent,
  GameStateSchema,
  Typestate<GameContext>
>;
