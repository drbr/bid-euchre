import * as _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { EventObject, State, Typestate } from 'xstate';
import { GameStateMachine } from '../euchreStateMachine/GameStateMachine';
import {
  GameContext,
  GameEvent,
  GameState,
  GameStateConfig,
  GameStateSchema,
} from '../euchreStateMachine/GameStateTypes';
import { EventCountContext } from './TypedStateInterfaces';

/**
 * Use a special object to store hydrated state so we can type-safely make sure we're requiring it,
 * because it's too easy to send a non-hydrated State Config object into a place that expects a
 * fully-hydrated state instance.
 */
export type HydratedState<C, E extends EventObject, S> = {
  hydratedState: State<C, E, S, Typestate<C>>;
};

export type HydratedGameState = HydratedState<
  GameContext,
  GameEvent,
  GameStateSchema
>;

export type StateWithPartialContext = Omit<
  ReturnType<typeof sanitizeStateMetadata>,
  'context'
> & {
  context: PartialDeep<GameContext> & EventCountContext;
};

export function getStateConfigFromJson(stateAsJson: string): GameStateConfig {
  return JSON.parse(stateAsJson);
}

export function hydrateStateFromConfig(
  stateConfig: GameStateConfig
): HydratedState<GameContext, GameEvent, GameState> {
  const createdState = State.create(stateConfig);
  const hydratedState = GameStateMachine.resolveState(createdState);
  return { hydratedState };
}

export function hydrateStateFromJson(stateAsJson: string): HydratedGameState {
  return hydrateStateFromConfig(getStateConfigFromJson(stateAsJson));
}

export function serializeState(
  state: GameState | StateWithPartialContext
): string {
  // TODO: Sanitize the metadata for _all_ states and remove the standalone
  // sanitizeStateMetadata method
  return JSON.stringify(state);
}

/**
 * Certain parts of the state aren't safe for clients to see, because they might expose extra
 * information. Clients don't need them in order to create the state on their end, so we whitelist
 * the "safe" fields for sending to the clients.
 */
export function sanitizeStateMetadata(state: GameState) {
  return _.pick(state, 'value', 'actions', 'event', '_event', 'context');
}
