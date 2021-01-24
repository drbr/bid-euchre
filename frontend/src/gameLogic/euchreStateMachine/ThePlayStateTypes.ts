import { State, Typestate } from 'xstate';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';
import { GameMeta } from './GameStateTypes';

export type ThePlayContext = {
  tricks: null;
};

export type ThePlayMeta = GameMeta;

export type ThePlayStatesGeneric<T> = {
  entry: T;
  thePlayComplete: T;
};

export type ThePlayStateNames = keyof ThePlayStatesGeneric<unknown>;

export type ThePlayStateSchema = {
  states: ThePlayStatesGeneric<TypedStateSchema<ThePlayMeta, ThePlayContext>>;
};

export type ThePlayEvent = {
  type: 'NEXT';
};

export type ThePlayState = State<
  ThePlayContext,
  ThePlayEvent,
  ThePlayStateSchema,
  Typestate<ThePlayContext>
>;
