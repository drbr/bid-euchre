import { State, StateConfig } from 'xstate';
import { GameStateMachine } from './stateMachine/GameStateMachine';
import {
  GameContext,
  GameEvent,
  GameState,
} from './stateMachine/GameStateTypes';

export function transitionStateMachine(
  prev: HydratedState<GameState> | null,
  event: GameEvent
): GameState {
  const stateObj = prev ? prev.hydratedState : undefined;
  const nextState = GameStateMachine.transition(stateObj, event);

  // Manually add the previous event count into the state object so the client can verify
  // that it didn't skip an update. One would think that the event count always increments by 1,
  // but the machine increments the count by more than 1 for some transitions.
  nextState.context.previousEventCount =
    prev?.hydratedState.context.eventCount || null;

  return nextState;
}

/**
 * Use a special object to store hydrated state so we can type-safely make sure we're requiring it,
 * because it's too easy to send a parsed object into a place that expects a fully-hydrated state
 * instance.
 */
export type HydratedState<T> = {
  hydratedState: T;
};

export function hydrateState(stateAsJson: string): HydratedState<GameState> {
  const parsed: StateConfig<GameContext, GameEvent> = JSON.parse(stateAsJson);
  const createdState = State.create(parsed);
  const hydratedState = GameStateMachine.resolveState(createdState);
  return { hydratedState: hydratedState };
}

export function serializeState(state: GameState): string {
  return JSON.stringify(state);
}

export function getInitialMachineState(): GameState {
  return GameStateMachine.initialState;
}
