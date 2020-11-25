import { StateSchema } from 'xstate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypedStateSchema<TMeta, TC = any> = StateSchema<TC> & {
  meta?: TMeta;
};
