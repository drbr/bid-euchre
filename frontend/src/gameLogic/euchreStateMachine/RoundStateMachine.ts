import { assign, StateNodeConfig } from 'xstate';
import { deal } from '../deal';
import { NextPlayer } from '../utils/ModelHelpers';
import {
  assignInitialBiddingContext,
  BiddingStates,
  getHighestBidSoFar,
} from './BiddingStateMachine';
import { BiddingContext } from './BiddingStateTypes';
import {
  RoundContext,
  RoundEvent,
  RoundStateSchema,
  StartDealEvent,
} from './RoundStateTypes';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';
import {
  assignInitialThePlayContext,
  ThePlayStates,
} from './ThePlayStateMachine';
import { ThePlayContext } from './ThePlayStateTypes';
import { GameMeta } from './GameStateTypes';

export const RoundStates: StateNodeConfig<
  RoundContext,
  RoundStateSchema,
  RoundEvent
> = {
  id: 'round',
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
          target: 'doDeal',
        },
      },
    },

    doDeal: {
      always: {
        actions: assign({
          private_hands: (context, event) => deal(),
        }),
        target: 'dealDone',
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
        TypedStateSchema<GameMeta, BiddingContext>,
        RoundEvent
      >),
      onDone: {
        target: 'thePlay',
        actions: assign((context) =>
          getHighestBidSoFar((context as unknown) as BiddingContext)
        ),
      },
    },

    thePlay: {
      ...(ThePlayStates as StateNodeConfig<
        RoundContext,
        TypedStateSchema<GameMeta, ThePlayContext>,
        RoundEvent
      >),
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
