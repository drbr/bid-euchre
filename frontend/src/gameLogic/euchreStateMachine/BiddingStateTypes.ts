import { State, Typestate } from 'xstate';
import { Bid } from '../EuchreTypes';
import { Position } from '../apiContract/database/Position';
import { AutoTransitionEvent } from '../stateMachineUtils/SpecialEvents';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';

export type BiddingContext = {
  bids: Record<Position, Bid | null>;
  awaitedPlayer: Position;
  highestBidder?: Position;
  highestBid?: Bid;
};

export type BiddingMeta = unknown;

export type BiddingStatesGeneric<T> = {
  waitForPlayerToBid: T;
  checkIfAllPlayersHaveBid: T;
  checkWinningBidder: T;
  waitForPlayerToNameTrump: T;
  complete: T;
};

export type BiddingStateNames = keyof BiddingStatesGeneric<unknown>;

export type BiddingStateSchema = {
  states: BiddingStatesGeneric<TypedStateSchema<BiddingMeta, BiddingContext>>;
};

export type PlayerBidEvent = {
  type: 'PLAYER_BID';
  bid: Bid;
  position: Position;
};

export type BiddingEvent = AutoTransitionEvent | PlayerBidEvent;

export type BiddingState = State<
  BiddingContext,
  BiddingEvent,
  BiddingStateSchema,
  Typestate<BiddingContext>
>;
