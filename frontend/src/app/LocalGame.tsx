import { useMachine } from '@xstate/react';
import { PublicGameConfig } from '../../../functions/apiContract/database/DataModel';
import { GameStateMachine } from '../gameLogic/stateMachine/GameStateMachine';
import { GameDisplay } from '../gameScreens/GameDisplay';

export function LocalGame() {
  const [state, send] = useMachine(GameStateMachine);

  return (
    <div>
      <h1>Local Game</h1>
      <p>
        Use this to develop and test the game UI locally, without involving the
        server.
      </p>
      <GameDisplay
        machineState={state}
        machineContext={state.context}
        sendGameEvent={send}
        gameConfig={DummyGameConfig}
        seatedAt="east"
      />
    </div>
  );
}

const DummyGameConfig: PublicGameConfig = {
  gameStatus: 'inProgress',
  playerFriendlyNames: {
    north: 'Nancy',
    west: 'William',
    south: 'Susan',
    east: 'Edward',
  },
};
