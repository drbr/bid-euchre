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

export type BiddingStatesGeneric<T> = {
  waitForPlayerToBid: T;
  checkIfBiddingIsComplete: T;
  biddingComplete: T;
};

export type BiddingStateSchema = {
  states: BiddingStatesGeneric<TypedStateSchema<BiddingMeta, BiddingContext>>;
};

export type BiddingEvent =
  | { type: 'PLAYER_BID'; bid: Bid; player: Position }
  | { type: 'NAME_TRUMP'; suit: Suit; player: Position };
