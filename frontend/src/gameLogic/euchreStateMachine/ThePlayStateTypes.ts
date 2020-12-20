import { State, Typestate } from 'xstate';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';

export type ThePlayContext = {
  tricks: null;
};

export type ThePlayMeta = unknown;

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
