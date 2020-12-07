import { AnyEventObject } from 'xstate';
import {
  InProgressGameConfig,
  PlayerPrivateGameState,
} from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { sendGameEvent } from '../firebase/CloudFunctionsClient';
import * as DAO from '../firebase/FrontendDAO';
import { GameState } from '../gameLogic/stateMachine/GameStateTypes';
import { GameDisplay } from '../gameScreens/GameDisplay';
import { UIActions } from '../uiHelpers/UIActions';
import { Subscription, useObservedState } from '../uiHelpers/useObservedState';

export type PlayGameProps = {
  gameId: string;
  playerId: string | null;
  gameConfig: InProgressGameConfig;
  seatedAt: Position | null;
};

export function PlayGame(props: PlayGameProps) {
  const { gameId, playerId } = props;

  const gameMachineState = useObservedState(
    { gameId },
    DAO.subscribeToPublicGameMachineState,
    onGameStateChange
  );

  const privateGameState = useObservedState(
    { gameId, playerId },
    privateGameStateSubscription
  );

  async function sendEventToStateMachine(event: AnyEventObject) {
    try {
      await sendGameEvent({
        event,
        existingEventCount: (gameMachineState as GameState).context.eventCount,
        gameId,
        playerId,
      });
    } catch (e) {
      UIActions.showErrorAlert(e, {
        message: 'Could not send game event. See log for details.',
      });
    }
  }

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).gameState = gameMachineState;
  (window as any).privateGameState = privateGameState;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (
    gameMachineState === 'loading' ||
    gameMachineState === 'gameNotFound' ||
    privateGameState === 'loading' ||
    privateGameState === 'gameNotFound'
  ) {
    return <div></div>;
  }

  return (
    <div>
      <p>
        {props.playerId ? null : 'You are a spectator of the current game!'}
      </p>
      <GameDisplay
        machineState={gameMachineState}
        machineContext={gameMachineState.context}
        sendGameEvent={sendEventToStateMachine}
        gameConfig={props.gameConfig}
        seatedAt={props.seatedAt}
      />
    </div>
  );
}

function onGameStateChange(prev: GameState, next: GameState) {
  const actualPrevCount = prev.context.eventCount;
  const expectedPrevCount = next.context.previousEventCount || 0;
  const nextCount = next.context.eventCount;
  console.debug('Applying new game state received from the database');
  console.debug(next);
  if (actualPrevCount !== expectedPrevCount) {
    console.warn(
      `Possible error in state transition: previous local state had event count ${actualPrevCount}, ` +
        `new state has previous eventCount ${expectedPrevCount} and current count ${nextCount}`
    );
    console.debug('Previous state:');
    console.debug(prev);
    console.debug('Next state:');
    console.debug(next);
  }
}

const privateGameStateSubscription: Subscription<
  { gameId: string; playerId: string | null },
  PlayerPrivateGameState
> = (params, callback) => {
  if (params.playerId) {
    return DAO.subscribeToPrivateGameState(
      { gameId: params.gameId, playerId: params.playerId },
      callback
    );
  }
};
