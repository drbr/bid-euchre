import { useCallback } from 'react';
import { AnyEventObject } from 'xstate';
import { InProgressGameConfig } from '../../../../functions/apiContract/database/DataModel';
import { transitionStateMachine } from '../../gameLogic/stateMachineUtils/transitionStateMachine';
import { GameStateMachine } from '../../gameLogic/euchreStateMachine/GameStateMachine';
import {
  GameEvent,
  GameState,
} from '../../gameLogic/euchreStateMachine/GameStateTypes';
import {
  HydratedGameState,
  hydrateStateFromConfig,
} from '../../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { willEventApply } from '../../gameLogic/stateMachineUtils/willEventApply';
import { GameDisplay } from '../../gameScreens/GameDisplay';
import { BufferEvent } from './BufferMachine';
import { useStateBuffer } from './useStateBuffer';

export function LocalGameContainer() {
  const [
    currentGameState,
    addSnapshotToBuffer,
    dispatchToBuffer,
  ] = useStateBuffer();

  if (!currentGameState) {
    return <div>ERROR: Game state is not defined</div>;
  }

  return (
    <LocalGame
      gameState={currentGameState}
      addSnapshotToBuffer={addSnapshotToBuffer}
      dispatchToBuffer={dispatchToBuffer}
    />
  );
}

export type LocalGameProps = {
  gameState: HydratedGameState;
  addSnapshotToBuffer: (snapshot: HydratedGameState) => void;
  dispatchToBuffer: (event: BufferEvent<HydratedGameState>) => void;
};

export function LocalGame(props: LocalGameProps) {
  const { addSnapshotToBuffer, gameState } = props;

  const sendGameEventToStateMachine = useCallback(
    async (event: GameEvent) => {
      const nextStates = await transitionStateMachine(
        GameStateMachine,
        gameState,
        event
      );
      for (const next of nextStates) {
        addSnapshotToBuffer(hydrateStateFromConfig(next));
      }
      // Add the new events to the buffer
    },
    [gameState, addSnapshotToBuffer]
  );

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).gameState = props.gameState.hydratedState;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  function isEventValid(event: AnyEventObject): boolean {
    return willEventApply(
      GameStateMachine,
      props.gameState.hydratedState,
      event as GameEvent
    );
  }

  return (
    <div>
      <h1>Local Game</h1>
      <p>
        Use this to develop and test the game UI locally, without involving the
        server.
      </p>
      <div>
        <ButtonToIncrementGameState
          eventName="START_GAME"
          state={gameState.hydratedState}
          send={sendGameEventToStateMachine}
        />
        <ButtonToIncrementGameState
          eventName="AUTO_TRANSITION"
          state={gameState.hydratedState}
          send={sendGameEventToStateMachine}
        />
        <ButtonToIncrementGameState
          eventName="SECRET_ACTION_COMPLETE"
          state={gameState.hydratedState}
          send={sendGameEventToStateMachine}
        />
      </div>
      <GameDisplay
        stateValue={gameState.hydratedState.value}
        stateContext={gameState.hydratedState.context}
        sendGameEvent={sendGameEventToStateMachine}
        isEventValid={isEventValid}
        gameConfig={DummyGameConfig}
        seatedAt="south"
      />
    </div>
  );
}

function ButtonToIncrementGameState(props: {
  eventName: GameEvent['type'];
  state: GameState;
  send: (event: GameEvent) => void;
}) {
  const buttonStyle: React.CSSProperties = { padding: 5, margin: 5 };
  const enabled = props.state.nextEvents.includes(props.eventName);
  return (
    <button
      disabled={!enabled}
      style={buttonStyle}
      onClick={() => props.send({ type: props.eventName })}
    >
      {props.eventName}
    </button>
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
