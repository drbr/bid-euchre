import * as _ from 'lodash';

import { assign, StateNodeConfig } from 'xstate';
import { Position } from '../../../../functions/apiContract/database/GameState';
import {
  BiddingContext,
  BiddingEvent,
  BiddingStateSchema,
} from './BiddingStateTypes';
import { forEachPosition, NextPlayer } from '../ModelHelpers';

// export function assignInitialBiddingContext(
//   gameContext: GameContext
// ): BiddingContext {
//   return {
//     // awaitedPlayer: gameContext.
//     bids: {
//       north: null,
//       south: null,
//       east: null,
//       west: null,
//     },
//   };
// }

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
          cond: (context) => !haveAllBidsBeenMade(context),
          target: 'waitForPlayerToBid',
          actions: assign({
            awaitedPlayer: (context) => NextPlayer[context.awaitedPlayer],
          }),
        },
        {
          cond: (context) => determineWinningBidder(context) === null,
          target: 'misdeal',
        },
        {
          cond: (context) => haveAllBidsBeenMade(context),
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

function haveAllBidsBeenMade(context: BiddingContext): boolean {
  return _.every(context.bids);
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
