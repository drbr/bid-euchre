import * as functions from 'firebase-functions';
import { STALE_STATE_ERROR } from '../entryPoints/executeSendGameEvent';

/**
 * Before applying the event, verify that the current state is in sync
 * between the client and the server, by checking that they both have
 * the same event count. Since we transactionally update the event count
 * and the client never touches the state directly, the two event counts
 * being equal should be sufficient to know that the two states are equal.
 *
 * @returns a boolean indicating whether some encountered counts were null.
 */
export function assertEventsAreInSync(
  eventCountA: number | null,
  eventCountB: number | null,
  options: { throwIfNull: boolean; }): { countsWereNull: boolean; } {
  const { throwIfNull } = options;

  if (eventCountA === null || eventCountB === null) {
    if (throwIfNull) {
      throw new Error(
        'Event counts in existing states are null, this should never happen!'
      );
    } else {
      return { countsWereNull: true };
    }
  }

  if (eventCountA !== eventCountB) {
    functions.logger.error('Stale state: event count mismatch');
    throw new STALE_STATE_ERROR();
  }

  return { countsWereNull: false };
}
