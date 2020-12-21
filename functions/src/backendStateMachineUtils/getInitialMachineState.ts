import { GameStateMachine } from '../../../frontend/src/gameLogic/euchreStateMachine/GameStateMachine';
import { GameState } from '../../../frontend/src/gameLogic/euchreStateMachine/GameStateTypes';

export function getInitialMachineState(): GameState {
  return GameStateMachine.initialState;
}
