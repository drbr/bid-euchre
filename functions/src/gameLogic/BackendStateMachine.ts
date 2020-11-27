import { GameStateMachine } from '../../../frontend/src/gameLogic/stateMachine/GameStateMachine';
import {
  GameEvent,
  GameState,
} from '../../../frontend/src/gameLogic/stateMachine/GameStateTypes';

export function transitionStateMachine(
  prev: GameState | null | undefined,
  event: GameEvent
): GameState {
  return GameStateMachine.transition(prev ?? undefined, event);
}

export function getInitialMachineState(): GameState {
  return GameStateMachine.initialState;
}
