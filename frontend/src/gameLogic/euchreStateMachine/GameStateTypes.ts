import { State, StateConfig, Typestate } from 'xstate';
import { Partnership } from '../EuchreTypes';
import {
  AutoTransitionEvent,
  SecretActionCompleteEvent,
  StartGameEvent,
} from '../stateMachineUtils/SpecialEvents';
import {
  EventCountContext,
  TypedStateSchema,
} from '../stateMachineUtils/TypedStateInterfaces';

/**
 * The points awarded to each team in the latest round. Because the "offense" team scores first,
 * they win if they pass the threshold, even if the "defense" team lands at a higher total, so we
 * track the two teams separately.
 */
export type ScoreDelta = Record<Partnership, { side: 'offense' | 'defense', delta: number}>;

export type GameContext = EventCountContext & {
  score: Record<Partnership, number>;
  scoreDelta: ScoreDelta | null;
};

export type GameMeta = {
  blocking?: boolean;
};

export type GameStatesGeneric<T> = {
  entry: T;
  round: T;
  checkIfGameIsWon: T;
  roundCompleteInfo: T;
  gameCompleteInfo: T;
};

export type GameStateNames = keyof GameStatesGeneric<unknown>;

export type GameStateSchema = {
  meta: GameMeta;
  states: {
    runGame: {
      states: GameStatesGeneric<TypedStateSchema<GameMeta, GameContext>>;
    };
    // recordEvents: TypedStateSchema<GameMeta, GameContext>;
  };
};

export type GameEvent =
  | StartGameEvent
  | AutoTransitionEvent
  | SecretActionCompleteEvent;

export type GameState = State<
  GameContext,
  GameEvent,
  GameStateSchema,
  Typestate<GameContext>
>;

export type GameStateConfig = StateConfig<GameContext, GameEvent>;
