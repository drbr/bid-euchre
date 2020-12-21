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
  NameTrumpEvent,
  RoundContext,
  RoundEvent,
  RoundMeta,
  RoundStateSchema,
} from './RoundStateTypes';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';
import {
  assignInitialThePlayContext,
  ThePlayStates,
} from './ThePlayStateMachine';
import { ThePlayContext } from './ThePlayStateTypes';

export const RoundStates: StateNodeConfig<
  RoundContext,
  RoundStateSchema,
  RoundEvent
> = {
  key: 'round',
  initial: 'waitForDeal',
  entry: assign({
    currentDealer: (context) => NextPlayer[context.currentDealer] || 'north',
  }),
  states: {
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
        return getHighestBid((context as unknown) as BiddingContext);
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
          target: 'waitForPlayerToNameTrump',
        },
      ],
    },

    waitForPlayerToNameTrump: {
      on: {
        NAME_TRUMP: {
          target: 'thePlay',
          cond: wasTrumpNamedByHighestBidder,
          actions: assign({
            trump: (context, event) => event.trumpSuit,
          }),
        },
      },
    },

    thePlay: {
      ...(ThePlayStates as StateNodeConfig<
        RoundContext,
        TypedStateSchema<RoundMeta, ThePlayContext>,
        RoundEvent
      >),
      entry: assign(
        (context) =>
          (assignInitialThePlayContext(context) as unknown) as RoundContext
      ),
      onDone: { target: 'scoring' },
    },

    scoring: {
      always: 'roundComplete',
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

function wasTrumpNamedByHighestBidder(
  context: RoundContext,
  event: NameTrumpEvent
): boolean {
  return context.highestBidder === event.position;
}

function allPlayersPassed(context: RoundContext): boolean {
  return context.highestBid === 'pass';
}
