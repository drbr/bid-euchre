import { Suit } from '../../../../functions/apiContract/database/Cards';
import {
  Position,
  Bid,
} from '../../../../functions/apiContract/database/GameState';
import { TypedStateSchema } from './TypedStateInterfaces';

export type BiddingContext = {
  bids: Record<Position, Bid>;
  awaitedPlayer: Position;
};

export type BiddingMeta = unknown;

export type BiddingStateSchema = {
  states: {
    waitForPlayerToBid: TypedStateSchema<BiddingMeta, BiddingContext>;
    checkIfBiddingIsComplete: TypedStateSchema<BiddingMeta, BiddingContext>;
    biddingComplete: TypedStateSchema<BiddingMeta, BiddingContext>;
  };
};

export type BiddingEvent =
  | { type: 'PLAYER_BID'; bid: Bid; player: Position }
  | { type: 'NAME_TRUMP'; suit: Suit; player: Position };
