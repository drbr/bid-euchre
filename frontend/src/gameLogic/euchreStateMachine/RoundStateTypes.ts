import { State, Typestate } from 'xstate';
import { Hand } from '../Cards';
import { Position } from '../apiContract/database/Position';
import {
  PlayerSpecificEvent,
  SecretActionCompleteEvent,
} from '../stateMachineUtils/SpecialEvents';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';
import { BiddingContext } from './BiddingStateTypes';

export type RoundContext = {
  roundIndex: number;
  currentDealer: Position;
  private_hands: Record<Position, Hand>;
  highestBidder: Required<BiddingContext>['highestBidder'];
  highestBid: Required<BiddingContext>['highestBid'];
  trump: Required<BiddingContext>['trump'];
};

export type RoundMeta = unknown;

export type RoundStatesGeneric<T> = {
  waitForDeal: T;
  dealDone: T;
  bidding: T;
  thePlay: T;
  scoring: T;
  roundComplete: T;
};

export type RoundStateNames = keyof RoundStatesGeneric<unknown>;

export type RoundStateSchema = {
  states: RoundStatesGeneric<TypedStateSchema<RoundMeta, RoundContext>>;
};

export type StartDealEvent = PlayerSpecificEvent<{
  type: 'DEALER_STARTS_DEAL';
}>;

export type RoundEvent = StartDealEvent | SecretActionCompleteEvent;

export type RoundState = State<
  RoundContext,
  RoundEvent,
  RoundStateSchema,
  Typestate<RoundContext>
>;
