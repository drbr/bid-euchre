import * as _ from 'lodash';

import { assign, StateNodeConfig } from 'xstate';
import {
  Bid,
  Position,
} from '../../../../functions/apiContract/database/GameState';
import {
  BiddingContext,
  BiddingEvent,
  BiddingStateSchema,
} from './BiddingStateTypes';
import { forEachPosition, NextPlayer } from '../ModelHelpers';
import { RoundContext } from './RoundStateTypes';

export const BiddingStates: StateNodeConfig<
  BiddingContext,
  BiddingStateSchema,
  BiddingEvent
> = {
  key: 'bidding',
  initial: 'waitForPlayerToBid',
  states: {
    waitForPlayerToBid: {
      on: {
        PLAYER_BID: {
          target: 'checkIfBiddingIsComplete',
          actions: assign({
            bids: (context, event) => ({
              ...context.bids,
              [context.awaitedPlayer]: event.bid,
            }),
          }),
        },
      },
    },

    checkIfBiddingIsComplete: {
      always: [
        {
          cond: function somePlayersHaveNotYetBid(context) {
            return !haveAllBidsBeenMade(context);
          },
          target: 'waitForPlayerToBid',
          actions: assign({
            awaitedPlayer: (context) => NextPlayer[context.awaitedPlayer],
          }),
        },
        {
          cond: haveAllBidsBeenMade,
          target: 'biddingComplete',
        },
      ],
    },

    biddingComplete: {
      type: 'final',
    },
  },
};

function haveAllBidsBeenMade(context: BiddingContext): boolean {
  return _.every(context.bids, (bid) => bid !== null);
}

export function assignInitialBiddingContext(
  parentContext: RoundContext
): BiddingContext {
  return {
    awaitedPlayer: NextPlayer[parentContext.currentDealer],
    bids: {
      north: null,
      south: null,
      east: null,
      west: null,
    },
  };
}

export function determineWinningBidder(
  context: BiddingContext
): {
  winningBidder: Position | undefined;
  winningBid: Bid;
} {
  let maxBid = 0;
  let winningBidder: Position | undefined = undefined;

  forEachPosition(context.bids, (bid, position) => {
    if (_.isNumber(bid) && bid > maxBid) {
      maxBid = bid;
      winningBidder = position;
    }
  });

  const winningBid = (winningBidder !== undefined ? maxBid : 'pass') as Bid;
  return { winningBidder, winningBid };
}
