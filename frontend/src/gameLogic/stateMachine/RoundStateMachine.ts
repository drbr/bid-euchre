import { assign, StateNodeConfig } from 'xstate';
import { deal } from '../deal';
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
  initial: 'dealHands',
  entry: assign({
    currentDealer: (context) => NextPlayer[context.currentDealer] || 'north',
  }),
  states: {
    dealHands: {
      always: {
        target: 'bidding',
        actions: assign({
          hands: (context) => deal(),
        }),
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
      onDone: { target: 'checkWinningBidder' },
    },

    checkWinningBidder: {
      always: [
        {
          target: 'dealHands',
          cond: allPlayersPassed,
        },
        {
          target: 'nameTrump',
        },
      ],
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

// const RoundActions: ActionFunctionMap<RoundContext, RoundEvent> = {};

// const RoundGuards: Record<
//   string,
//   ConditionPredicate<RoundContext, RoundEvent>
// > = {};

function allPlayersPassed(context: RoundContext): boolean {
  return context.winningBid === 'pass';
}
