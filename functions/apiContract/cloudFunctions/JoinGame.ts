import { Position } from '../database/GameState';

export type JoinGameRequest = {
  gameId: string;
  position: Position;
  friendlyName: string;
};

export type JoinGameResult = JoinGameRequest & {
  playerId: string;
};
