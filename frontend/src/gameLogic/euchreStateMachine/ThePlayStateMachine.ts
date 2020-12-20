import { StateNodeConfig } from 'xstate';
import {
  ThePlayContext,
  ThePlayEvent,
  ThePlayStateSchema,
} from './ThePlayStateTypes';
import { RoundContext } from './RoundStateTypes';

export const ThePlayStates: StateNodeConfig<
  ThePlayContext,
  ThePlayStateSchema,
  ThePlayEvent
> = {
  key: 'thePlay',
  initial: 'entry',
  states: {
    entry: {},
    thePlayComplete: {
      type: 'final',
    },
  },
};

export function assignInitialThePlayContext(
  parentContext: RoundContext
): ThePlayContext {
  return {
    tricks: null,
  };
}
