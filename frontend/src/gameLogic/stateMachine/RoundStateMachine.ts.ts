import { assign, StateNodeConfig } from 'xstate';
import { NextPlayer } from '../ModelHelpers';
import {
  assignInitialBiddingContext,
  BiddingStates,
  determineWinningBidder,
} from './BiddingStateMachine';
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
  initial: 'incrementDealerAndDealHands',
  states: {
    incrementDealerAndDealHands: {
      always: {
        target: 'bidding',
        actions: assign(incrementDealerAndDealHands),
      },
    },
    bidding: {
      ...(BiddingStates as StateNodeConfig<
        RoundContext,
        TypedStateSchema<RoundMeta, BiddingContext>,
        RoundEvent
      >),
      entry: assign(
        (context) =>
          (assignInitialBiddingContext(context) as unknown) as RoundContext
      ),
      exit: assign((context) =>
        determineWinningBidder((context as unknown) as BiddingContext)
      ),
      onDone: { target: 'nameTrump' },
    },
    nameTrump: {},
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

function incrementDealerAndDealHands(context: RoundContext): RoundContext {
  return {
    currentDealer: NextPlayer[context.currentDealer] || 'north',
    hands: {
      east: [{ rank: '9', suit: 'C' }],
      north: [],
      south: [],
      west: [],
    },
  };
}
