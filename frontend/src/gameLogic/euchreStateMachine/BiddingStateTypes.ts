import { State, Typestate } from 'xstate';
import { Position } from '../apiContract/database/Position';
import { Suit } from '../Cards';
import { Bid } from '../EuchreTypes';
import {
  AutoTransitionEvent,
  PlayerSpecificEvent,
  SecretActionCompleteEvent,
} from '../stateMachineUtils/SpecialEvents';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';
import { GameMeta } from './GameStateTypes';
import { RoundContext } from './RoundStateTypes';
import { PlayCardEvent } from './ThePlayStateTypes';

export type BiddingContext = Pick<RoundContext, 'private_hands'> & {
  awaitedPlayer: Position;
  bids: Record<Position, Bid | null>;
  trump?: Suit;
};

export type BiddingStatesGeneric<T> = {
  waitForPlayerToBid: T;
  checkIfAllPlayersHaveBid: T;
  checkWinningBidder: T;
  allPlayersPassedInfo: T;
  waitForPlayerToNameTrump: T;
  playerNamedTrumpInfo: T;
  checkIfGoingAlone: T;
  waitForMakerToPassCard: T;
  makerPassedCard: T;
  waitForPartnerToPassCard: T;
  partnerPassedCard: T;
  complete: T;
};

export type BiddingStateNames = keyof BiddingStatesGeneric<unknown>;

export type BiddingStateSchema = {
  meta: GameMeta;
  states: BiddingStatesGeneric<TypedStateSchema<GameMeta, BiddingContext>>;
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
  | SecretActionCompleteEvent
  | PlayerBidEvent
  | NameTrumpEvent
  | PlayCardEvent;

export type BiddingState = State<
  BiddingContext,
  BiddingEvent,
  BiddingStateSchema,
  Typestate<BiddingContext>
>;
