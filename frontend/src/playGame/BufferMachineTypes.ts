import { AnyEventObject, State } from 'xstate';
import {
  TypedStateSchema,
  TypedStateValue,
} from '../gameLogic/stateMachineUtils/TypedStateInterfaces';

/**
 * This buffer stores all the known game state snapshots and controls how the client moves through
 * them over time.
 */
export type StateBuffer<S> = {
  /**
   * The index of the snapshot currently being displayed
   */
  readonly currentIndexShowing: number | null;

  /**
   * The index of the latest snapshot that has ever been displayed. The machine will not allow
   * advancing past the head in detached mode.
   */
  readonly head: number | null;

  /**
   * All the snapshots that are known to the client, including those past the head that have never
   * been displayed
   */
  readonly gameStateSnapshots: ReadonlyArray<
    SnapshotWithBlockingInfo<S> | undefined
  >;
};

/**
 * Describes how the buffer machine will block the UI from advancing head while displaying this
 * snapshot.
 *
 * - `block` This snapshot will be shown until an `UNBLOCK_HEAD` event is explicitly sent to the
 *   buffer machine.
 * - `linger` This snapshot will be shown for `LINGER_DISPLAY_MS` milliseconds before advancing to
 *   the next snapshot.
 */
export type BlockType = 'block' | 'linger';

export type SnapshotWithBlockingInfo<S> = {
  snapshot: S;
  blockType: BlockType;
};

export const LINGER_DELAY_MS = 1000;

type BufferStatesGeneric<X> = {
  /**
   * The machine starts in this state until the buffer has populated all the snapshots up to and
   * including the head.
   */
  loading: X;

  loaded: {
    states: {
      showHead: {
        states: {
          /**
           * The entry point for showing a new head state. This transient node decides which of the
           * "showHead*" states should be used, based on the new head's configuration.
           */
          enterHead: X;

          /**
           * Showing the head while it's in the mandatory "linger" period. This is implemented by invoking
           * a delayed UNBLOCK_HEAD event and immediately transitioning to showHeadBlocked.
           */
          lingering: X;

          /**
           * Showing the head while it's blocked – the machine will not advance the head until it receives
           * the UNBLOCK_HEAD event.
           */
          blocked: X;

          /**
           * Showing the head while unblocked – the head can be advanced at any time.
           */
          unblocked: X;
        };
      };

      /**
       * Showing a state older than the head (one that the player has already played). In detached mode,
       * the machine can move freely from state to state, ignoring blocks or lingers.
       */
      showSnapshotDetached: X;
    };
  };

  /**
   * Sending a new game event to the server. Will display the head during this action,
   * and not allow moving to detached mode.
   */
  sendingGameEvent: {
    states: {
      makeApiCall: X;
      prepareToTrySendingAgain: X;
      waitForDataToSync: X;
    };
  };
};

export type BufferStateSchema<S> = {
  states: BufferStatesGeneric<TypedStateSchema<unknown, StateBuffer<S>>>;
};

export type BufferStateValue = TypedStateValue<BufferStateSchema<unknown>>;

export type RecvSnapshotEvent<S> = {
  type: 'RECV_SNAPSHOT';

  /** The game state snapshot */
  snapshot: S;

  /**
   * The index of this snapshot in the list of all snapshots. Probably corresponds to the
   * `eventCount` field. */
  index: number;

  /**
   * Describes how the buffer machine will block the UI from advancing head while displaying this
   * snapshot.
   *
   * - `block` This snapshot will be shown until an `UNBLOCK_HEAD` event is explicitly sent to the
   *   buffer machine.
   * - `linger` This snapshot will be shown for `LINGER_DISPLAY_MS` milliseconds before advancing to
   *   the next snapshot.
   */
  blockType: 'block' | 'linger';
};

type SwitchToDetachedIndexEvent = {
  type: 'DETACHED_GO_TO_INDEX';
  index: number;
};

export type SendGameEventToServerEvent = {
  type: 'SEND_GAME_EVENT_TO_SERVER';

  /**
   * Yes, this event object contains another event object, because the inner one is the event
   * sent to the game state machine (on the server). The buffer machine merely controls how and when
   * the game states are displayed.
   */
  gameEvent: AnyEventObject;
};

export type BufferEvent<S> =
  | RecvSnapshotEvent<S>
  | { type: 'DETACHED_GO_FORWARD' }
  | { type: 'DETACHED_GO_BACK' }
  | SwitchToDetachedIndexEvent
  | SendGameEventToServerEvent
  | { type: 'UNBLOCK_HEAD' }
  | { type: 'RESET' };

export type BufferMachineState<S> = State<
  StateBuffer<S>,
  BufferEvent<S>,
  BufferStateSchema<S>
>;
