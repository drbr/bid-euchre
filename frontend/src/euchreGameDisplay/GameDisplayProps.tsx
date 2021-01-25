import { EventObject, StateValue } from 'xstate';
import { InProgressGameConfig } from '../gameLogic/apiContract/database/DataModel';
import { Position } from '../gameLogic/apiContract/database/Position';

/**
 * The "scoped" props are those whose types need to match the substate we're currently in.
 * At each level of the game display component hierarchy, we re-scope these types to correspond
 * to the context/event types at that level.
 */
export type ScopedGameDisplayProps<C, E extends EventObject> = {
  stateValue: StateValue;
  stateContext: C;
  isEventValid: (event: E) => boolean;
  sendGameEvent: (event: E) => void;
};

/** The "unscoped" props are the same no matter which state we're currently in. */
export type UnscopedGameDisplayProps = {
  gameConfig: InProgressGameConfig;
  seatedAt: Position | null;
  sendGameEventInProgress: boolean;
  unblockHead: (() => void) | null;
};
