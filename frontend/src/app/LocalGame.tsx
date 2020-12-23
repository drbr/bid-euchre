import { useMachine } from '@xstate/react';
import { AnyEventObject } from 'xstate';
import { InProgressGameConfig } from '../../../functions/apiContract/database/DataModel';
import { GameStateMachine } from '../gameLogic/euchreStateMachine/GameStateMachine';
import {
  GameEvent,
  GameState,
} from '../gameLogic/euchreStateMachine/GameStateTypes';
import { willEventApply } from '../gameLogic/stateMachineUtils/willEventApply';
import { GameDisplay } from '../gameScreens/GameDisplay';
import * as LocalGameStates from './LocalGameStates';

export function LocalGame() {
  const [state, send] = useMachine(GameStateMachine, {
    devTools: true,
    state: LocalGameStates.freshGame,
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
      <div>
        <ButtonToIncrementState
          eventName="START_GAME"
          state={state}
          send={send}
        />
        <ButtonToIncrementState
          eventName="AUTO_TRANSITION"
          state={state}
          send={send}
        />
        <ButtonToIncrementState
          eventName="SECRET_ACTION_COMPLETE"
          state={state}
          send={send}
        />
      </div>
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

function ButtonToIncrementState(props: {
  eventName: GameEvent['type'];
  state: GameState;
  send: (eventName: GameEvent['type']) => void;
}) {
  const buttonStyle: React.CSSProperties = { padding: 5, margin: 5 };
  const enabled = props.state.nextEvents.includes(props.eventName);
  return (
    <button
      disabled={!enabled}
      style={buttonStyle}
      onClick={() => props.send(props.eventName)}
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
