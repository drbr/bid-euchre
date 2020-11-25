import { StateNodeConfig } from 'xstate';
import { BiddingStates } from './BiddingStateMachine';
import { BiddingContext } from './BiddingStateTypes';
import {
  RoundContext,
  RoundEvent,
  RoundMeta,
  RoundStateSchema,
} from './RoundStateTypes';
import { TypedStateSchema } from './TypedStateInterfaces';

export const RoundStates: StateNodeConfig<
  RoundContext,
  RoundStateSchema,
  RoundEvent
> = {
  key: 'round',
  initial: 'dealing',
  entry: 'initContext',
  states: {
    dealing: {
      on: {
        NEXT: {
          target: 'bidding',
          cond: (context) => {
            console.log('Checking the context');
            return true;
          },
        },
      },
    },
    bidding: {
      on: {
        NEXT: 'thePlay',
      },
      ...(BiddingStates as StateNodeConfig<
        RoundContext,
        TypedStateSchema<RoundMeta, BiddingContext>,
        RoundEvent
      >),
    },
    thePlay: {
      on: {
        NEXT: 'scoring',
      },
    },
    scoring: {
      on: {
        NEXT: 'roundComplete',
      },
    },
    roundComplete: {
      type: 'final',
    },
  },
};
