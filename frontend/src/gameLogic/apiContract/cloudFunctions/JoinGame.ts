import { Position } from "../database/Position";

export type JoinGameRequest = {
  gameId: string;
  position: Position;
  friendlyName: string;
};

export type JoinGameResult = JoinGameRequest & {
  playerId: string;
};
