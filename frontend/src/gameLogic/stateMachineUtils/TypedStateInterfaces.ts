import { StateSchema } from 'xstate';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypedStateSchema<TMeta, C = any> = StateSchema<C> & {
  meta?: TMeta;
};

/**
 * State machine context that includes the event count.
 * We use this to ensure consistency between the client and server.
 */
export type EventCountContext = {
  eventCount: number;
  previousEventCount: number | null;
};

/**
 * A type-safe way of expressing an XState machine's "state value",
 * for use as the argument to `state.matches`.
 */
export type TypedStateValue<StateSchema> = StateSchema extends {
  states: unknown;
}
  ?
      | keyof StateSchema['states']
      | {
          [K in keyof StateSchema['states']]?: TypedStateValue<
            StateSchema['states'][K]
          >;
        }
  : never;
