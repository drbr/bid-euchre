import { AnyEventObject } from 'xstate';

export type SendGameEventRequest = {
  /** The game ID. */
  gameId: string;

  /** The event to apply to the game */
  event: AnyEventObject;

  /** The number of events currently in the game. Used to detect stale state. */
  existingEventCount: number;

  /**
   * The player ID, as returned by `joinGame`. Used to verify the user's ability to participate in
   * this game and which position they're seated at.
   */
  playerId: string;
};

export type SendGameEventResult = void;
