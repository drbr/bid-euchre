import { State, StateConfig, Typestate } from 'xstate';
import { Partnership } from '../../../../functions/apiContract/database/GameState';
import {
  EventCountContext,
  TypedStateSchema,
} from '../stateMachineUtils/TypedStateInterfaces';

export type GameContext = EventCountContext & {
  score: Record<Partnership, number>;
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
    // recordEvents: TypedStateSchema<GameMeta, GameContext>;
  };
};

export type GameEvent = { type: 'START_GAME' };

export type GameState = State<
  GameContext,
  GameEvent,
  GameStateSchema,
  Typestate<GameContext>
>;

export type GameStateConfig = StateConfig<GameContext, GameEvent>;
