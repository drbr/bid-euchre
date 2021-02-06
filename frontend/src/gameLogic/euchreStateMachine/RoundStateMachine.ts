import * as _ from 'lodash';
import { assign, StateNodeConfig } from 'xstate';
import { deal } from '../deal';
import { NextPlayer } from '../utils/PositionHelpers';
import { BiddingStates, getHighestBidSoFar } from './BiddingStateMachine';
import { BiddingContext } from './BiddingStateTypes';
import {
  RoundContext,
  RoundEvent,
  RoundStateSchema,
  StartDealEvent,
} from './RoundStateTypes';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';
import { ThePlayStates } from './ThePlayStateMachine';
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
  entry: assign((context) => assignInitialRoundContext(context)),
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
      onDone: {
        target: 'roundComplete',
      },
    },

    roundComplete: {
      type: 'final',
    },
  },
};

function assignInitialRoundContext(context: RoundContext): RoundContext {
  return {
    // Initially roundIndex should be 0, on subsequent rounds increment it by 1
    roundIndex: (context.roundIndex ?? -1) + 1,
    currentDealer: NextPlayer[context.currentDealer] ?? 'north',
    private_hands: context.private_hands ?? {
      north: [],
      south: [],
      east: [],
      west: [],
    },
    highestBidder: undefined,
    highestBid: undefined,
    trump: undefined,
    trickCount: {
      north: 0,
      south: 0,
      east: 0,
      west: 0,
    },
  };
}

function isDealerDealing(
  context: RoundContext,
  event: StartDealEvent
): boolean {
  return event.position === context.currentDealer;
}
