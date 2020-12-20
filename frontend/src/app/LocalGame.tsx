import { useMachine } from '@xstate/react';
import { AnyEventObject } from 'xstate';
import { InProgressGameConfig } from '../../../functions/apiContract/database/DataModel';
import { GameStateMachine } from '../gameLogic/euchreStateMachine/GameStateMachine';
import { GameEvent } from '../gameLogic/euchreStateMachine/GameStateTypes';
import { willEventApply } from '../gameLogic/stateMachineUtils/willEventApply';
import { GameDisplay } from '../gameScreens/GameDisplay';
import * as LocalGameStates from './LocalGameStates';

export function LocalGame() {
  const [state, send] = useMachine(GameStateMachine, {
    devTools: true,
    state: LocalGameStates.nameTrump,
  });

  function isEventValid(event: AnyEventObject): boolean {
    return willEventApply(GameStateMachine, state, event as GameEvent);
  }

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).gameState = state;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div>
      <h1>Local Game</h1>
      <p>
        Use this to develop and test the game UI locally, without involving the
        server.
      </p>
      <GameDisplay
        stateValue={state.value}
        stateContext={state.context}
        sendGameEvent={send}
        isEventValid={isEventValid}
        gameConfig={DummyGameConfig}
        seatedAt="south"
      />
    </div>
  );
}

const DummyGameConfig: InProgressGameConfig = {
  gameStatus: 'inProgress',
  playerFriendlyNames: {
    north: 'Nancy',
    west: 'William',
    south: 'Susan',
    east: 'Edward',
  },
};
