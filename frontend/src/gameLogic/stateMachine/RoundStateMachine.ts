import { assign, send, SendAction, StateNodeConfig } from 'xstate';
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
  initial: 'waitForDeal',
  entry: assign({
    currentDealer: (context) => NextPlayer[context.currentDealer] || 'north',
  }),
  states: {
    waitForDeal: {
      // TODO: Dispatch an action that tells the server to send an "assignHands" event so that
      // we have the event for replay purposes. The server needs to send this event because the
      // clients aren't supposed to know what the other players' cards are.
      entry: makeAssignHandsEventSender(),
      on: {
        ASSIGN_HANDS: {
          target: 'bidding',
          actions: assign({
            hands: (context, event) => event.hands,
          }),
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
      exit: assign((context) =>
        determineWinningBidder((context as unknown) as BiddingContext)
      ),
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

/**
 * Make an action object that will send an ASSIGN_HANDS event.
 * Each time this function is called, it will create a new random assignment of cards.
 */
function makeAssignHandsEventSender(): SendAction<
  RoundContext,
  RoundEvent,
  RoundEvent
> {
  return send({ type: 'ASSIGN_HANDS', hands: deal() } as RoundEvent);
}

// const RoundGuards: Record<
//   string,
//   ConditionPredicate<RoundContext, RoundEvent>
// > = {};

function allPlayersPassed(context: RoundContext): boolean {
  return context.winningBid === 'pass';
}
