import { AnyEventObject } from 'xstate';
import { Position } from '../database/GameState';

export type SendGameEventRequest = {
  event: AnyEventObject;
  gameId: string;
  playerId: string;
  position: Position;
};

export type SendGameEventResult = void;
