import * as _ from 'lodash';
import { assign, StateNodeConfig } from 'xstate';
import { Bid, Position } from '../apiContract/database/GameState';
import { forEachPosition, NextPlayer } from '../utils/ModelHelpers';
import {
  BiddingContext,
  BiddingEvent,
  BiddingStateSchema,
  PlayerBidEvent,
} from './BiddingStateTypes';
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
        // PLAYER_BID: {
        //   target: 'checkIfBiddingIsComplete',
        //   cond: isBidEventValid,
        //   actions: assign({
        //     bids: (context, event) => ({
        //       ...context.bids,
        //       [event.position]: event.bid,
        //     }),
        //   }),
        // },
        AUTO_TRANSITION: {
          target: 'checkIfBiddingIsComplete',
          actions: assign({
            bids: (context) => ({
              ...context.bids,
              [context.awaitedPlayer]: 4,
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
  event: PlayerBidEvent
): boolean {
  return event.position === context.awaitedPlayer;
}

function isBidValid(context: BiddingContext, event: PlayerBidEvent): boolean {
  // A player can always pass
  if (event.bid === 'pass') {
    return true;
  }

  const { highestBid } = getHighestBid(context);
  const highestAllowed = UltimateBidChart[highestBid];
  const highestExisting = _.isNumber(highestBid) ? highestBid : 0;
  return event.bid > (highestExisting || 0) && event.bid <= highestAllowed;
}

function isBidEventValid(
  context: BiddingContext,
  event: PlayerBidEvent
): boolean {
  return (
    wasBidMadeByAwaitedPlayer(context, event) && isBidValid(context, event)
  );
}

/**
 * The highest allowed bid for the highest value bid so far
 */
export const UltimateBidChart: Record<Bid, Bid> = {
  pass: 24,
  1: 24,
  2: 24,
  3: 24,
  4: 24,
  5: 24,
  6: 24,
  12: 24,
  24: 48,
  48: 96,
  96: 192,
  192: 192,
};

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
