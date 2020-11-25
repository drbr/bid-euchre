import * as _ from 'lodash';

import { assign, MachineOptions, StateNodeConfig } from 'xstate';
import { Position } from '../../../../functions/apiContract/database/GameState';
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
  entry: 'initContext',
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
          cond: 'somePlayersHaveNotYetBid',
          target: 'waitForPlayerToBid',
          actions: assign({
            awaitedPlayer: (context) => NextPlayer[context.awaitedPlayer],
          }),
        },
        {
          cond: 'noWinningBidder',
          target: 'misdeal',
        },
        {
          cond: 'haveAllBidsBeenMade',
          target: 'waitForPlayerToNameTrump',
          actions: assign({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            awaitedPlayer: (context) => determineWinningBidder(context)!,
          }),
        },
      ],
    },
    waitForPlayerToNameTrump: {
      on: {
        NAME_TRUMP: 'biddingComplete',
      },
    },
    biddingComplete: { type: 'final' },
    misdeal: { type: 'final' },
  },
};

export const BiddingOptions: Partial<
  MachineOptions<BiddingContext, BiddingEvent>
> = {
  guards: {
    somePlayersHaveNotYetBid: (context) => !haveAllBidsBeenMade(context),
    noWinningBidder: (context) => determineWinningBidder(context) === null,
    haveAllBidsBeenMade: (context) => haveAllBidsBeenMade(context),
  },
  actions: {
    initContext: assign(assignInitialBiddingContext),
  },
};

export function assignInitialBiddingContext(
  context: BiddingContext
): BiddingContext {
  const parentContext = (context as unknown) as RoundContext;
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

function haveAllBidsBeenMade(context: BiddingContext): boolean {
  return _.every(context.bids, (bid) => bid !== null);
}

function determineWinningBidder(context: BiddingContext): Position | null {
  let maxBid = 0;
  let winningBidder: Position | null = null;

  forEachPosition(context.bids, (bid, position) => {
    if (_.isNumber(bid) && bid > maxBid) {
      maxBid = bid;
      winningBidder = position;
    }
  });

  return winningBidder;
}
