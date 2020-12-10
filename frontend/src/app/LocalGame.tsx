import { useMachine } from '@xstate/react';
import { InProgressGameConfig } from '../../../functions/apiContract/database/DataModel';
import { GameStateMachine } from '../gameLogic/euchreStateMachine/GameStateMachine';
import { GameDisplay } from '../gameScreens/GameDisplay';
import * as LocalGameStates from './LocalGameStates';

export function LocalGame() {
  const [state, send] = useMachine(GameStateMachine, {
    devTools: true,
    state: LocalGameStates.freshGame,
  });

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
        gameConfig={DummyGameConfig}
        seatedAt="east"
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
