import { State, Typestate } from 'xstate';
import { Position } from '../apiContract/database/Position';
import { Hand } from '../Cards';
import { Bid } from '../EuchreTypes';
import {
  PlayerSpecificEvent,
  SecretActionCompleteEvent,
} from '../stateMachineUtils/SpecialEvents';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';
import { BiddingContext } from './BiddingStateTypes';
import { GameMeta } from './GameStateTypes';

export type RoundContextAlways = {
  roundIndex: number;
  currentDealer: Position;
  private_hands: Record<Position, Hand>;
};

export type RoundContextAfterBidding = RoundContextAlways & {
  highestBidder?: Position;
  highestBid?: Bid;
  trump?: Required<BiddingContext>['trump'];
};

export type RoundContext = RoundContextAlways & RoundContextAfterBidding;

export type RoundMeta = GameMeta;

export type RoundStatesGeneric<T> = {
  waitForDeal: T;
  doDeal: T;
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
