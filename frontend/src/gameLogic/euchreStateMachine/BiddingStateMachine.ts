import * as _ from 'lodash';
import { assign, StateNodeConfig } from 'xstate';
import { Bid } from '../EuchreTypes';
import { Position } from '../apiContract/database/Position';
import {
  forEachPosition,
  NextPlayer,
  PartnerOf,
} from '../utils/PositionHelpers';
import {
  BiddingContext,
  BiddingEvent,
  BiddingStateSchema,
  PlayerBidEvent,
} from './BiddingStateTypes';
import { RoundContext } from './RoundStateTypes';
import { PlayerSpecificEvent } from '../stateMachineUtils/SpecialEvents';
import { isCardPlayedByAwaitedPlayerAndInTheirHand } from './ThePlayStateMachine';
import { PlayCardEvent } from './ThePlayStateTypes';

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
          actions: assign({
            awaitedPlayer: (context) =>
              getHighestBidOrThrow(context).highestBidder,
          }),
        },
      ],
    },

    allPlayersPassedInfo: {
      meta: { blocking: true },
      on: {
        AUTO_TRANSITION: '#round.doDeal',
      },
    },

    waitForPlayerToNameTrump: {
      on: {
        NAME_TRUMP: {
          target: 'playerNamedTrumpInfo',
          cond: wasEventMadeByAwaitedPlayer,
          actions: assign({
            trump: (context, event) => event.trumpSuit,
          }),
        },
      },
    },

    playerNamedTrumpInfo: {
      meta: { blocking: true },
      on: {
        AUTO_TRANSITION: 'checkIfGoingAlone',
      },
    },

    checkIfGoingAlone: {
      always: [
        {
          target: 'waitForMakerToPassCard',
          cond: (context) => getHighestBidOrThrow(context).highestBid === 12,
        },
        {
          target: 'complete',
        },
      ],
    },

    waitForMakerToPassCard: {
      on: {
        PLAY_CARD: {
          target: 'makerPassedCard',
          cond: isCardPlayedByAwaitedPlayerAndInTheirHand,
          actions: assign({
            private_hands: (context, event) =>
              playerHandsForPassedCard(context, event),
            awaitedPlayer: (context) => PartnerOf[context.awaitedPlayer],
          }),
        },
      },
    },

    makerPassedCard: {
      on: {
        SECRET_ACTION_COMPLETE: 'waitForPartnerToPassCard',
      },
    },

    waitForPartnerToPassCard: {
      on: {
        PLAY_CARD: {
          target: 'partnerPassedCard',
          cond: isCardPlayedByAwaitedPlayerAndInTheirHand,
          actions: assign({
            private_hands: (context, event) =>
              playerHandsForPassedCard(context, event),
            awaitedPlayer: (context) => PartnerOf[context.awaitedPlayer],
          }),
        },
      },
    },

    partnerPassedCard: {
      on: {
        SECRET_ACTION_COMPLETE: 'complete',
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
    private_hands: parentContext.private_hands,
    bids: {
      north: null,
      south: null,
      east: null,
      west: null,
    },
  };
}

function wasEventMadeByAwaitedPlayer(
  context: BiddingContext,
  event: PlayerSpecificEvent<unknown>
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
    wasEventMadeByAwaitedPlayer(context, event) && isBidValid(context, event)
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

export function getHighestBidOrThrow(
  context: BiddingContext
): {
  highestBidder: Position;
  highestBid: Bid;
} {
  const { highestBid, highestBidder } = getHighestBidSoFar(context);
  if (!highestBid || !highestBidder) {
    throw new Error('No player placed a bid');
  }
  return { highestBid, highestBidder };
}

export function playerHandsForPassedCard(
  context: BiddingContext,
  event: PlayCardEvent
): BiddingContext['private_hands'] {
  const originalHands = context.private_hands;

  const passer = event.position;
  const passee = PartnerOf[event.position];

  const passerHand = originalHands[passer].filter(
    (c) => !_.isEqual(c, event.card)
  );
  const passeeHand = originalHands[passee].concat(event.card);

  return {
    ...originalHands,
    [passer]: passerHand,
    [passee]: passeeHand,
  };
}
