import { State, Typestate } from 'xstate';
import { Card } from '../Cards';
import { PlayerSpecificEvent } from '../stateMachineUtils/SpecialEvents';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';
import { GameMeta } from './GameStateTypes';

export type ThePlayContext = {
  tricks: null;
};

export type ThePlayStatesGeneric<T> = {
  entry: T;
  thePlayComplete: T;
};

export type ThePlayStateNames = keyof ThePlayStatesGeneric<unknown>;

export type ThePlayStateSchema = {
  meta: GameMeta;
  states: ThePlayStatesGeneric<TypedStateSchema<GameMeta, ThePlayContext>>;
};

export type PlayCardEvent = PlayerSpecificEvent<{
  type: 'PLAY_CARD';
  card: Card;
}>;

export type ThePlayEvent = PlayCardEvent;

export type ThePlayState = State<
  ThePlayContext,
  ThePlayEvent,
  ThePlayStateSchema,
  Typestate<ThePlayContext>
>;
