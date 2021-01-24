import { State, Typestate } from 'xstate';
import { Position } from '../apiContract/database/Position';
import { Suit } from '../Cards';
import { Bid } from '../EuchreTypes';
import {
  AutoTransitionEvent,
  PlayerSpecificEvent,
} from '../stateMachineUtils/SpecialEvents';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';
import { GameMeta } from './GameStateTypes';

export type BiddingContext = {
  awaitedPlayer: Position;
  bids: Record<Position, Bid | null>;
  trump?: Suit;
};

export type BiddingMeta = GameMeta;

export type BiddingStatesGeneric<T> = {
  waitForPlayerToBid: T;
  checkIfAllPlayersHaveBid: T;
  checkWinningBidder: T;
  allPlayersPassedInfo: T;
  waitForPlayerToNameTrump: T;
  playerNamedTrumpInfo: T;
  complete: T;
};

export type BiddingStateNames = keyof BiddingStatesGeneric<unknown>;

export type BiddingStateSchema = {
  states: BiddingStatesGeneric<TypedStateSchema<BiddingMeta, BiddingContext>>;
};

export type PlayerBidEvent = PlayerSpecificEvent<{
  type: 'PLAYER_BID';
  bid: Bid;
}>;

export type NameTrumpEvent = PlayerSpecificEvent<{
  type: 'NAME_TRUMP';
  trumpSuit: Suit;
}>;

export type BiddingEvent =
  | AutoTransitionEvent
  | PlayerBidEvent
  | NameTrumpEvent;

export type BiddingState = State<
  BiddingContext,
  BiddingEvent,
  BiddingStateSchema,
  Typestate<BiddingContext>
>;
