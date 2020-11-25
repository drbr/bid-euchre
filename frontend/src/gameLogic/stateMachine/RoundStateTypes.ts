import { Hand } from '../../../../functions/apiContract/database/Cards';
import { Position } from '../../../../functions/apiContract/database/GameState';
import { TypedStateSchema } from './TypedStateInterfaces';

export type RoundContext = {
  currentDealer: Position;
  hands: Record<Position, Hand>;
};

export type RoundStateSchema = {
  states: {
    dealing: TypedStateSchema<unknown, unknown>;
    bidding: TypedStateSchema<unknown, unknown>;
    thePlay: TypedStateSchema<unknown, unknown>;
    scoring: TypedStateSchema<unknown, unknown>;
  };
};
