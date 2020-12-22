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
}