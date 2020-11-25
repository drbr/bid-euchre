import { Machine, StateNodeConfig } from 'xstate';
import { Partnership } from '../../../../functions/apiContract/database/GameState';
import { BiddingStates } from './BiddingStateMachine';
import { BiddingContext } from './BiddingStateTypes';
import { TypedStateSchema } from './TypedStateInterfaces';

export type GameContext = BiddingContext & {
  score: Record<Partnership, number>;
};

export type GameMeta = unknown;

export type GameStateSchema = {
  states: {
    setup: TypedStateSchema<GameMeta, GameContext>;
    deal: TypedStateSchema<GameMeta, GameContext>;
    bidding: TypedStateSchema<GameMeta, BiddingContext>;
    thePlay: TypedStateSchema<GameMeta, GameContext>;
    scoring: TypedStateSchema<GameMeta, GameContext>;
  };
};

export type GameEvent = { type: 'NEXT' };

export const EuchreStateMachine = Machine<
  GameContext,
  GameStateSchema,
  GameEvent
>({
  id: 'Euchre Game',
  initial: 'setup',
  context: {
    score: {
      eastwest: 0,
      northsouth: 0,
    },
  } as GameContext,
  states: {
    setup: {
      on: { NEXT: 'deal' },
    },
    deal: {
      on: { NEXT: 'bidding' },
    },
    bidding: BiddingStates as StateNodeConfig<
      GameContext,
      TypedStateSchema<GameMeta, BiddingContext>,
      GameEvent
    >,
    thePlay: {
      on: { NEXT: 'scoring' },
    },
    scoring: {
      on: { NEXT: 'bidding' },
    },
  },
});
