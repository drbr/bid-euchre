import { Hand, Suit } from '../../../../functions/apiContract/database/Cards';
import {
  Bid,
  Position,
} from '../../../../functions/apiContract/database/GameState';
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
    dealHands: TypedStateSchema<unknown, RoundContext>;
    bidding: TypedStateSchema<unknown, RoundContext>;
    checkWinningBidder: TypedStateSchema<unknown, RoundContext>;
    nameTrump: TypedStateSchema<unknown, RoundContext>;
    thePlay: TypedStateSchema<unknown, RoundContext>;
    scoring: TypedStateSchema<unknown, RoundContext>;
    roundComplete: TypedStateSchema<unknown, RoundContext>;
  };
};

export type RoundEvent = { type: 'NEXT' };
