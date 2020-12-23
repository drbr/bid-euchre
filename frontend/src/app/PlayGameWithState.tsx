import { Dispatch, memo } from 'react';
import { AnyEventObject } from 'xstate';
import { GameStateMachine } from '../gameLogic/euchreStateMachine/GameStateMachine';
import {
  GameState,
  GameEvent,
} from '../gameLogic/euchreStateMachine/GameStateTypes';
import { willEventApply } from '../gameLogic/stateMachineUtils/willEventApply';
import { GameDisplay } from '../gameScreens/GameDisplay';
import { PlayGameProps, StateBufferAction } from './PlayGame';

export type PlayGameWithStateProps = PlayGameProps & {
  gameState: GameState;
  sendGameEvent: (event: AnyEventObject) => void;
  dispatchStateBufferAction: Dispatch<StateBufferAction>;
};

export const PlayGameForStatePure = memo(function PlayGameForState(
  props: PlayGameWithStateProps
) {
  const goForward = () =>
    props.dispatchStateBufferAction({ type: 'goForward' });
  const goBack = () => props.dispatchStateBufferAction({ type: 'goBack' });

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).goForward = goForward;
  (window as any).goBack = goBack;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  function isEventValid(event: AnyEventObject): boolean {
    return willEventApply(
      GameStateMachine,
      props.gameState,
      event as GameEvent
    );
  }

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).gameState = props.gameState;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div>
      <p>
        {props.playerId ? null : 'You are a spectator of the current game!'}
      </p>
      <GameDisplay
        stateValue={props.gameState.value}
        stateContext={props.gameState.context}
        gameConfig={props.gameConfig}
        seatedAt={props.seatedAt}
        sendGameEvent={props.sendGameEvent}
        isEventValid={isEventValid}
      />
    </div>
  );
});
