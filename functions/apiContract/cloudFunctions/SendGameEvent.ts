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
   *
   * Ideally this shouldn't be null, but it's possible the client might screw up
   * and send a game event when it shouldn't.
   */
  playerId: string | null;
};

export type SendGameEventResult = void;
