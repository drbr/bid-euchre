import { GameStateMachine } from '../gameLogic/stateMachine/GameStateMachine';
import { GameEvent } from '../gameLogic/stateMachine/GameStateTypes';

const events: GameEvent[] = [];

export function runIsolatedMachine() {
  console.log('Starting to run isolated machine transitions');

  let state = GameStateMachine.initialState;
  console.log('GameStateMachine initial state stringified:');
  console.log(JSON.stringify(GameStateMachine.initialState));

  console.log('Starting at state:');
  console.log(state);

  for (const e of events) {
    console.log('Applying event:');
    console.log(e);
    state = GameStateMachine.transition(state, e);
    console.log('Arrived at state:');
    console.log(state);
  }

  console.log('Finished running isolated machine transitions');
}
