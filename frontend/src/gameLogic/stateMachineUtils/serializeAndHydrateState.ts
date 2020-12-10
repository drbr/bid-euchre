import * as _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { EventObject, State, StateConfig, Typestate } from 'xstate';
import { GameStateMachine } from '../euchreStateMachine/GameStateMachine';
import {
  GameContext,
  GameEvent,
  GameState,
  GameStateSchema,
} from '../euchreStateMachine/GameStateTypes';
import { EventCountContext } from './TypedStateInterfaces';

/**
 * Use a special object to store hydrated state so we can type-safely make sure we're requiring it,
 * because it's too easy to send a parsed object into a place that expects a fully-hydrated state
 * instance.
 */
export type HydratedState<C, E extends EventObject, S> = {
  stateConfig: StateConfig<C, E>;
  hydratedState: State<C, E, S, Typestate<C>>;
};

export type HydratedGameState = HydratedState<
  GameContext,
  GameEvent,
  GameStateSchema
>;

export type StateWithPartialContext = Omit<
  ReturnType<typeof sanitizeState>,
  'context'
> & {
  context: PartialDeep<GameContext> & EventCountContext;
};

export function hydrateState(stateAsJson: string): HydratedGameState {
  const stateConfig: StateConfig<GameContext, GameEvent> = JSON.parse(
    stateAsJson
  );
  const createdState = State.create(stateConfig);
  const hydratedState = GameStateMachine.resolveState(createdState);
  return { stateConfig, hydratedState };
}

export function serializeState(state: StateWithPartialContext): string {
  return JSON.stringify(state);
}

/**
 * Certain parts of the state aren't safe fur clients to see, because they might expose extra information.
 * Clients don't need them in order to create the state on their end, so we whitelist the "safe" fields
 * for sending to the clients.
 */
export function sanitizeState(state: GameState) {
  return _.pick(state, 'value', 'actions', 'event', '_event', 'context');
}


