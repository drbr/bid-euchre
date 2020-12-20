import { State, Typestate } from 'xstate';
import { Hand, Suit } from '../../../../functions/apiContract/database/Cards';
import {
  Bid,
  Position,
} from '../../../../functions/apiContract/database/GameState';
import { PrivateActionCompleteEvent } from '../stateMachineUtils/SpecialEvents';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';

export type RoundContext = {
  currentDealer: Position;
  private_hands: Record<Position, Hand>;
  highestBidder?: Position;
  highestBid?: Bid;
  trump?: Suit;
};

export type RoundMeta = unknown;

export type RoundStatesGeneric<T> = {
  waitForDeal: T;
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

export type NameTrumpEvent = {
  type: 'NAME_TRUMP';
  position: Position;
  trumpSuit: Suit;
};

export type RoundEvent =
  | { type: 'NEXT' }
  | { type: 'ASSIGN_HANDS'; hands: Record<Position, Hand> }
  | NameTrumpEvent
  | PrivateActionCompleteEvent;

export type RoundState = State<
  RoundContext,
  RoundEvent,
  RoundStateSchema,
  Typestate<RoundContext>
>;
