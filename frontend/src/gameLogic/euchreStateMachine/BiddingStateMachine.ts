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
import { forEachPosition, NextPlayer } from '../utils/ModelHelpers';
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
          cond: (context, event) =>
            wasBidMadeByAwaitedPlayer(context, event) &&
            isBidValid(context, event),
          actions: assign({
            bids: (context, event) => ({
              ...context.bids,
              [event.position]: event.bid,
            }),
          }),
        },
      },
    },

    checkIfBiddingIsComplete: {
      always: [
        {
          cond: haveAllBidsBeenMade,
          target: 'biddingComplete',
        },
        {
          target: 'waitForPlayerToBid',
          actions: assign({
            awaitedPlayer: (context) => NextPlayer[context.awaitedPlayer],
          }),
        },
      ],
    },

    biddingComplete: {
      type: 'final',
    },
  },
};

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

function wasBidMadeByAwaitedPlayer(
  context: BiddingContext,
  event: BiddingEvent
): boolean {
  return event.position === context.awaitedPlayer;
}

function isBidValid(context: BiddingContext, event: BiddingEvent): boolean {
  if (event.bid === 'pass') {
    return true;
  }
  const { highestBid } = getHighestBid(context);
  if (!_.isNumber(highestBid)) {
    return true;
  } else if (event.bid > highestBid) {
    return true;
  } else {
    return false;
  }
}

function haveAllBidsBeenMade(context: BiddingContext): boolean {
  return _.every(context.bids, (bid) => bid !== null);
}

export function getHighestBid(
  context: BiddingContext
): {
  highestBidder: Position | undefined;
  highestBid: Bid;
} {
  let highestSoFar = 0;
  let highestBidder: Position | undefined = undefined;

  forEachPosition(context.bids, (bid, position) => {
    if (_.isNumber(bid) && bid > highestSoFar) {
      highestSoFar = bid;
      highestBidder = position;
    }
  });

  const highestBid = (highestBidder !== undefined
    ? highestSoFar
    : 'pass') as Bid;
  return { highestBidder, highestBid };
}
