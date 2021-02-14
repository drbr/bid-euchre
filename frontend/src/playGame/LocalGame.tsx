import { useEffect } from 'react';
import { AnyEventObject } from 'xstate';
import { GameDisplayDelegatorPure } from '../euchreGameDisplay/GameDisplayDelegator';
import { InProgressGameConfig } from '../gameLogic/apiContract/database/DataModel';
import { Position } from '../gameLogic/apiContract/database/Position';
import { GameStateMachine } from '../gameLogic/euchreStateMachine/GameStateMachine';
import {
  GameEvent,
  GameStateConfig,
} from '../gameLogic/euchreStateMachine/GameStateTypes';
import {
  HydratedGameState,
  hydrateStateFromConfig,
  sanitizeStateMetadata,
  serializeState,
} from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { transitionStateMachine } from '../gameLogic/stateMachineUtils/transitionStateMachine';
import * as LocalGameStates from './LocalGameStates';
import { BufferMachineMode, useStateBuffer } from './useStateBuffer';

const InitialLocalGameState: GameStateConfig = LocalGameStates.PlayedOneCard;

function hydrateInitialState() {
  return hydrateStateFromConfig(InitialLocalGameState);
}

/** Change this variable to pick where you're seated at the table */
const seatedAt: Position | null = 'east';

export function LocalGameContainer() {
  const {
    currentGameState,
    addSnapshotToBuffer,
    sendGameEventViaBufferMachine,
    isGameEventValid,
    unblockHead,
    dispatchToBuffer,
    bufferMachineMode,
  } = useStateBuffer({
    participatingInGame: !!seatedAt,
    initialHead: 1,
    sendGameEventToServer: async (
      currentGameState: HydratedGameState,
      gameEvent: AnyEventObject
    ) => {
      const nextStates = await transitionStateMachine(
        GameStateMachine,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        currentGameState,
        gameEvent as GameEvent,
        { initializeNextGame: () => Promise.resolve('newGameUrl') }
      );
      for (const next of nextStates) {
        addSnapshotToBuffer(hydrateStateFromConfig(next));
      }
    },
  });

  // Populate the initial game state into the buffer
  useEffect(() => addSnapshotToBuffer(hydrateInitialState()), [
    addSnapshotToBuffer,
  ]);

  if (!currentGameState) {
    return <div>ERROR: Game state is not defined</div>;
  }

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).goForward = () =>
    dispatchToBuffer({ type: 'DETACHED_GO_FORWARD' });
  (window as any).goBack = () => dispatchToBuffer({ type: 'DETACHED_GO_BACK' });
  (window as any).gameState = currentGameState.hydratedState;
  (window as any).serializedGameState = serializeState(
    sanitizeStateMetadata(currentGameState.hydratedState)
  );
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <LocalGame
      gameState={currentGameState}
      sendGameEvent={sendGameEventViaBufferMachine}
      isEventValid={isGameEventValid}
      bufferMachineMode={bufferMachineMode}
      unblockHead={unblockHead}
    />
  );
}

export type LocalGameProps = {
  gameState: HydratedGameState;
  sendGameEvent: (event: GameEvent) => void;
  isEventValid: (event: GameEvent) => boolean;
  bufferMachineMode: BufferMachineMode;
  unblockHead: (() => void) | null;
};

export function LocalGame(props: LocalGameProps) {
  return (
    <div style={{ width: '100%' }}>
      <GameDisplayDelegatorPure
        stateValue={props.gameState.hydratedState.value}
        stateContext={props.gameState.hydratedState.context}
        isEventValid={props.isEventValid}
        sendGameEvent={props.sendGameEvent}
        bufferMachineMode={props.bufferMachineMode}
        unblockHead={props.unblockHead}
        gameConfig={DummyGameConfig}
        seatedAt={seatedAt}
      />
    </div>
  );
}

const DummyGameConfig: InProgressGameConfig = {
  gameStatus: 'inProgress',
  playerFriendlyNames: {
    north: 'Nancy',
    west: 'Westeros King of all Evil',
    south: 'Susan',
    east: 'Edward',
  },
};
