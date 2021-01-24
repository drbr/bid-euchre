import * as _ from 'lodash';
import { assign, StateNodeConfig } from 'xstate';
import { Bid } from '../EuchreTypes';
import { Position } from '../apiContract/database/Position';
import { forEachPosition, NextPlayer } from '../utils/ModelHelpers';
import {
  BiddingContext,
  BiddingEvent,
  BiddingStateSchema,
  NameTrumpEvent,
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
  entry: assign((context) =>
    assignInitialBiddingContext((context as unknown) as RoundContext)
  ),
  states: {
    waitForPlayerToBid: {
      on: {
        PLAYER_BID: {
          target: 'checkIfAllPlayersHaveBid',
          cond: isBidEventValid,
          actions: assign({
            bids: (context, event) => ({
              ...context.bids,
              [event.position]: event.bid,
            }),
          }),
        },
      },
    },

    checkIfAllPlayersHaveBid: {
      always: [
        {
          cond: haveAllBidsBeenMade,
          target: 'checkWinningBidder',
        },
        {
          target: 'waitForPlayerToBid',
          actions: assign({
            awaitedPlayer: (context) => NextPlayer[context.awaitedPlayer],
          }),
        },
      ],
    },

    checkWinningBidder: {
      always: [
        {
          target: 'allPlayersPassedInfo',
          cond: allPlayersPassed,
        },
        {
          target: 'waitForPlayerToNameTrump',
        },
      ],
    },

    allPlayersPassedInfo: {
      on: {
        AUTO_TRANSITION: '#round.waitForDeal',
      },
    },

    waitForPlayerToNameTrump: {
      on: {
        NAME_TRUMP: {
          target: 'playerNamedTrumpInfo',
          cond: wasTrumpNamedByHighestBidder,
          actions: assign({
            trump: (context, event) => event.trumpSuit,
          }),
        },
      },
    },

    playerNamedTrumpInfo: {
      on: {
        AUTO_TRANSITION: 'complete',
      },
    },

    complete: {
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

  const { highestBid } = getHighestBidSoFar(context);
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

function wasTrumpNamedByHighestBidder(
  context: BiddingContext,
  event: NameTrumpEvent
): boolean {
  const { highestBidder } = getHighestBidSoFar(context);
  return highestBidder === event.position;
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

function allPlayersPassed(context: BiddingContext): boolean {
  return _.every(context.bids, (bid) => bid === 'pass');
}

export function getHighestBidSoFar(
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
