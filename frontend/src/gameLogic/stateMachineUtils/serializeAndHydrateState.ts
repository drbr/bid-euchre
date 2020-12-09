import * as _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { EventObject, State, StateConfig, Typestate } from 'xstate';
import { PlayerIdentities } from '../../../../functions/apiContract/database/DataModel';
import { GameStateMachine } from '../euchreStateMachine/GameStateMachine';
import {
  GameContext,
  GameEvent,
  GameState,
  GameStateSchema,
} from '../euchreStateMachine/GameStateTypes';
import { extractPrivateGameState } from './extractPrivateState';
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
function sanitizeState(state: GameState) {
  return _.pick(state, 'value', 'actions', 'event', '_event', 'context');
}

/**
 * Sanitizes the state and breaks it apart into "public state" and "private contexts".
 * The JSON objects returned by this method are in formats safe to send to clients.
 *
 * @param state
 * @param playerIdentities
 */
export function preparePublicAndPrivateStateForStorage(
  state: GameState,
  playerIdentities: PlayerIdentities
) {
  const sanitizedState = sanitizeState(state);

  const { publicContext, privateContextsByPlayerId } = extractPrivateGameState(
    state.context,
    playerIdentities
  );

  const publicState = { ...sanitizedState, context: publicContext };
  const publicStateJson = serializeState(publicState);

  const privateContextsJsonByPlayerId = _.mapValues(
    privateContextsByPlayerId,
    (context) => JSON.stringify(context)
  );

  return { publicStateJson, privateContextsJsonByPlayerId };
}
