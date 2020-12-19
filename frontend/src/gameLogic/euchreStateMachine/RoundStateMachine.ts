import { assign, StateNodeConfig } from 'xstate';
import { deal } from '../deal';
import { NextPlayer } from '../utils/ModelHelpers';
import {
  assignInitialBiddingContext,
  BiddingStates,
  getHighestBid,
} from './BiddingStateMachine';
import { BiddingContext } from './BiddingStateTypes';
import {
  RoundContext,
  RoundEvent,
  RoundMeta,
  RoundStateSchema,
} from './RoundStateTypes';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';

export const RoundStates: StateNodeConfig<
  RoundContext,
  RoundStateSchema,
  RoundEvent
> = {
  key: 'round',
  initial: 'entry',
  entry: assign({
    currentDealer: (context) => NextPlayer[context.currentDealer] || 'north',
  }),
  states: {
    entry: {
      on: {
        NEXT: { target: 'waitForDeal' },
      },
    },
    waitForDeal: {
      invoke: {
        id: 'dealHands',
        src: (context, event) => (callback, onReceive) => {
          callback({ type: 'ASSIGN_HANDS', hands: deal() });
          callback({ type: 'PRIVATE_ACTION_COMPLETE' });
        },
      },
      on: {
        ASSIGN_HANDS: {
          actions: assign({
            private_hands: (context, event) => event.hands,
          }),
        },
        PRIVATE_ACTION_COMPLETE: {
          target: 'bidding',
        },
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
      exit: assign((context) => {
        const { highestBid, highestBidder } = getHighestBid(
          (context as unknown) as BiddingContext
        );
        return {
          winningBid: highestBid,
          winningBidder: highestBidder,
        };
      }),
      onDone: { target: 'checkWinningBidder' },
    },

    checkWinningBidder: {
      always: [
        {
          target: 'waitForDeal',
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

// const RoundGuards: Record<
//   string,
//   ConditionPredicate<RoundContext, RoundEvent>
// > = {};

function allPlayersPassed(context: RoundContext): boolean {
  return context.winningBid === 'pass';
}
