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
import { ThePlayContext } from './ThePlayStateTypes';

export type RoundContext = {
  roundIndex: number;
  currentDealer: Position;
  private_hands: Record<Position, Hand>;
  highestBidder: Position | undefined;
  highestBid: Bid | undefined;
  trump: BiddingContext['trump'];
  trickCount: ThePlayContext['trickCount'];
};

export type RoundStatesGeneric<T> = {
  waitForDeal: T;
  doDeal: T;
  dealDone: T;
  bidding: T;
  thePlay: T;
  roundComplete: T;
};

export type RoundStateNames = keyof RoundStatesGeneric<unknown>;

export type RoundStateSchema = {
  meta: GameMeta;
  states: RoundStatesGeneric<TypedStateSchema<GameMeta, RoundContext>>;
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
