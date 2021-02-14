import { State, Typestate } from 'xstate';
import { Position } from '../apiContract/database/Position';
import { Card } from '../Cards';
import {
  AutoTransitionEvent,
  PlayerSpecificEvent,
} from '../stateMachineUtils/SpecialEvents';
import { TypedStateSchema } from '../stateMachineUtils/TypedStateInterfaces';
import { GameMeta } from './GameStateTypes';
import { RoundContext } from './RoundStateTypes';

export type ThePlayMeta = {
  trickReplay?: 'start' | 'end';
}

export type ThePlayContext = Pick<
  RoundContext,
  'private_hands' | 'trump' | 'playersSittingOut'
> & {
  trickCount: Record<Position, number>;
  leader: Position;
  awaitedPlayer: Position;
  currentTrick: Record<Position, Card | null>;
};

export type ThePlayStatesGeneric<T> = {
  trick: {
    states: {
      waitForLead: T;
      waitForFollow: T;
      checkIfAllPlayersHavePlayed: T;
      complete: T;
    };
  };
  trickCompleteInfo: T;
  checkIfMoreTricksToPlay: T;
  thePlayComplete: T;
};

export type ThePlayStateNames = keyof ThePlayStatesGeneric<unknown>;

export type ThePlayStateSchema = {
  meta: GameMeta & ThePlayMeta;
  states: ThePlayStatesGeneric<TypedStateSchema<GameMeta, ThePlayContext>>;
};

export type PlayCardEvent = PlayerSpecificEvent<{
  type: 'PLAY_CARD';
  card: Card;
}>;

export type ThePlayEvent = PlayCardEvent | AutoTransitionEvent;

export type ThePlayState = State<
  ThePlayContext,
  ThePlayEvent,
  ThePlayStateSchema,
  Typestate<ThePlayContext>
>;
