import { GameStateMachine } from '../euchreStateMachine/GameStateMachine';
import { GameState } from '../euchreStateMachine/GameStateTypes';

export function getInitialMachineState(): GameState {
  return GameStateMachine.initialState;
}
