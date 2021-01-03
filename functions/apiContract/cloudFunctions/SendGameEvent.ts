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

/**
 * These "error codes" get sent back in specific cases where the frontend needs to respond in a
 * specific way.
 */
// As per https://github.com/typescript-eslint/typescript-eslint/issues/2483:
// I would use @typescript-eslint/no-shadow but I can't change the configuration from CRA :-(
// eslint-disable-next-line no-shadow
export const enum SendGameEventErrorDetail {
  StaleState = 'STALE_STATE',
  InvalidStateTransition = 'INVALID_STATE_TRANSITION',
}
