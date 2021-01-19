import { useCallback, useEffect } from 'react';
import FlexView from 'react-flexview/lib';
import { AnyEventObject } from 'xstate';
import { GameDisplayPure } from '../euchreGameDisplay/GameDisplay';
import { InProgressGameConfig } from '../gameLogic/apiContract/database/DataModel';
import { GameStateMachine } from '../gameLogic/euchreStateMachine/GameStateMachine';
import {
  GameEvent,
  GameState,
  GameStateConfig,
} from '../gameLogic/euchreStateMachine/GameStateTypes';
import {
  HydratedGameState,
  hydrateStateFromConfig,
} from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { transitionStateMachine } from '../gameLogic/stateMachineUtils/transitionStateMachine';
import { willEventApply } from '../gameLogic/stateMachineUtils/willEventApply';
import * as LocalGameStates from './LocalGameStates';
import { BufferMachineMode, useStateBuffer } from './useStateBuffer';

const InitialLocalGameState: GameStateConfig = LocalGameStates.StartBidding;

function hydrateInitialState() {
  return hydrateStateFromConfig(InitialLocalGameState);
}

export function LocalGameContainer() {
  const {
    currentGameState,
    addSnapshotToBuffer,
    dispatchToBuffer,
    bufferMachineMode,
  } = useStateBuffer({
    initialHead: 1,
    sendGameEventToServer: async (
      currentGameState: HydratedGameState,
      gameEvent: AnyEventObject
    ) => {
      const nextStates = await transitionStateMachine(
        GameStateMachine,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        currentGameState,
        gameEvent as GameEvent
      );
      for (const next of nextStates) {
        addSnapshotToBuffer(hydrateStateFromConfig(next));
      }
    },
  });

  const sendGameEventToBufferMachine = useCallback(
    (event: AnyEventObject) => {
      dispatchToBuffer({
        type: 'SEND_GAME_EVENT_TO_SERVER',
        gameEvent: event,
      });
    },
    [dispatchToBuffer]
  );

  // Populate the initial game state into the buffer
  useEffect(() => addSnapshotToBuffer(hydrateInitialState()), [
    addSnapshotToBuffer,
  ]);

  if (!currentGameState) {
    return <div>ERROR: Game state is not defined</div>;
  }

  return (
    <LocalGame
      gameState={currentGameState}
      sendGameEvent={sendGameEventToBufferMachine}
      bufferMachineMode={bufferMachineMode}
    />
  );
}

export type LocalGameProps = {
  gameState: HydratedGameState;
  sendGameEvent: (event: GameEvent) => void;
  bufferMachineMode: BufferMachineMode;
};

export function LocalGame(props: LocalGameProps) {
  const { sendGameEvent, gameState } = props;

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).gameState = props.gameState.hydratedState;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const isEventValid = useCallback(
    (event: AnyEventObject): boolean =>
      props.bufferMachineMode === 'head' &&
      willEventApply(GameStateMachine, props.gameState, event as GameEvent),
    [props.bufferMachineMode, props.gameState]
  );

  return (
    <div>
      <h1>Local Game</h1>
      <p>
        Use this to develop and test the game UI locally, without involving the
        server.
      </p>
      <FlexView hAlignContent="center">
        {/* TODO buttons to go forward and back */}
      </FlexView>
      <FlexView hAlignContent="center">
        <ButtonToIncrementGameState
          eventName="START_GAME"
          state={gameState.hydratedState}
          send={sendGameEvent}
        />
        <ButtonToIncrementGameState
          eventName="AUTO_TRANSITION"
          state={gameState.hydratedState}
          send={sendGameEvent}
        />
        <ButtonToIncrementGameState
          eventName="SECRET_ACTION_COMPLETE"
          state={gameState.hydratedState}
          send={sendGameEvent}
        />
      </FlexView>
      <GameDisplayPure
        stateValue={gameState.hydratedState.value}
        stateContext={gameState.hydratedState.context}
        isEventValid={isEventValid}
        sendGameEvent={sendGameEvent}
        sendGameEventInProgress={props.bufferMachineMode === 'sendingGameEvent'}
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
