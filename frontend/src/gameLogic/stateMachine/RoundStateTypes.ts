import { Hand, Suit } from '../../../../functions/apiContract/database/Cards';
import { Bid, Position } from '../../../../functions/apiContract/database/GameState';
import { TypedStateSchema } from './TypedStateInterfaces';

export type RoundContext = {
  currentDealer: Position;
  hands: Record<Position, Hand>;
  winningBidder?: Position;
  winningBid?: Bid;
  trump?: Suit;
};

export type RoundMeta = unknown;

export type RoundStateSchema = {
  states: {
    incrementDealerAndDealHands: TypedStateSchema<unknown, unknown>;
    bidding: TypedStateSchema<unknown, unknown>;
    nameTrump: TypedStateSchema<unknown, unknown>;
    thePlay: TypedStateSchema<unknown, unknown>;
    scoring: TypedStateSchema<unknown, unknown>;
    roundComplete: TypedStateSchema<unknown, unknown>;
  };
};

export type RoundEvent = { type: 'NEXT' };
