import { State, Typestate } from 'xstate';
import { Hand, Suit } from '../Cards';
import { Bid } from '../EuchreTypes';
import { Position } from '../apiContract/database/Position';
import { SecretActionCompleteEvent } from '../stateMachineUtils/SpecialEvents';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';

export type RoundContext = {
  roundIndex: number;
  currentDealer: Position;
  private_hands: Record<Position, Hand>;
  highestBidder?: Position;
  highestBid?: Bid;
  trump?: Suit;
};

export type RoundMeta = unknown;

export type RoundStatesGeneric<T> = {
  waitForDeal: T;
  dealDone: T;
  bidding: T;
  checkWinningBidder: T;
  waitForPlayerToNameTrump: T;
  thePlay: T;
  scoring: T;
  roundComplete: T;
};

export type RoundStateNames = keyof RoundStatesGeneric<unknown>;

export type RoundStateSchema = {
  states: RoundStatesGeneric<TypedStateSchema<RoundMeta, RoundContext>>;
};

export type StartDealEvent = {
  type: 'DEALER_STARTS_DEAL';
  position: Position;
};

export type NameTrumpEvent = {
  type: 'NAME_TRUMP';
  position: Position;
  trumpSuit: Suit;
};

export type RoundEvent =
  | StartDealEvent
  | NameTrumpEvent
  | SecretActionCompleteEvent;

export type RoundState = State<
  RoundContext,
  RoundEvent,
  RoundStateSchema,
  Typestate<RoundContext>
>;
