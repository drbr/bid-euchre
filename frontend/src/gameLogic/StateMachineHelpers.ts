import { State, StateConfig } from 'xstate';
import { GameStateMachine } from './stateMachine/GameStateMachine';
import {
  GameContext,
  GameEvent,
  GameState,
} from './stateMachine/GameStateTypes';

export function transitionStateMachine(
  prev: HydratedState | null,
  event: GameEvent
): GameState {
  const stateObj = prev ? prev.hydratedState : undefined;
  return GameStateMachine.transition(stateObj, event);
}

export type HydratedState = {
  hydratedState: GameState;
};

export function hydrateState(stateAsJson: string): HydratedState | null {
  const parsed: StateConfig<GameContext, GameEvent> = JSON.parse(stateAsJson);
  const createdState = State.create(parsed);
  const hydratedState = GameStateMachine.resolveState(createdState);
  return { hydratedState: hydratedState };
}

export function convertStateToJson(state: GameState): string {
  return JSON.stringify(state);
}

export function getInitialMachineState(): GameState {
  return GameStateMachine.initialState;
}
