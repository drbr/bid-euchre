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
  StartDealEvent,
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
    roundIndex: (context) => (context.roundIndex ? context.roundIndex + 1 : 0),
    currentDealer: (context) => NextPlayer[context.currentDealer] || 'north',
  }),
  states: {
    waitForDeal: {
      on: {
        DEALER_STARTS_DEAL: {
          cond: isDealerDealing,
          actions: assign({
            private_hands: (context, event) => deal(),
          }),
          target: 'dealDone',
        },
      },
    },

    dealDone: {
      on: {
        SECRET_ACTION_COMPLETE: 'bidding',
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

function isDealerDealing(
  context: RoundContext,
  event: StartDealEvent
): boolean {
  return event.position === context.currentDealer;
}

function wasTrumpNamedByHighestBidder(
  context: RoundContext,
  event: NameTrumpEvent
): boolean {
  return context.highestBidder === event.position;
}

function allPlayersPassed(context: RoundContext): boolean {
  return context.highestBid === 'pass';
}
