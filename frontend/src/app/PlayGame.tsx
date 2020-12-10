import { AnyEventObject } from 'xstate';
import { InProgressGameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { sendGameEvent } from '../firebase/CloudFunctionsClient';
import * as DAO from '../firebase/FrontendDAO';
import {
  GameContext,
  GameState,
} from '../gameLogic/euchreStateMachine/GameStateTypes';
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

  const fetchedPublicGameState = useObservedState(
    { gameId },
    DAO.subscribeToPublicGameState,
    onGameStateChange
  );

  const fetchedPrivateGameState = useObservedState(
    { gameId, playerId },
    privateGameStateSubscription
  );

  async function sendEventToStateMachine(event: AnyEventObject) {
    try {
      await sendGameEvent({
        event,
        existingEventCount: (fetchedPublicGameState as GameState).context
          .eventCount,
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
  (window as any).gameState = fetchedPublicGameState;
  (window as any).privateGameState = fetchedPrivateGameState;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (
    fetchedPublicGameState === 'loading' ||
    fetchedPublicGameState === 'gameNotFound' ||
    (playerId &&
      (fetchedPrivateGameState === 'loading' ||
        fetchedPrivateGameState === 'gameNotFound'))
  ) {
    return <div>Loading game…</div>;
  }

  return (
    <div>
      <p>
        {props.playerId ? null : 'You are a spectator of the current game!'}
      </p>
      <GameDisplay
        machineState={fetchedPublicGameState}
        machineContext={fetchedPublicGameState.context}
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
  Partial<GameContext>
> = (params, callback) => {
  if (params.playerId) {
    return DAO.subscribeToPrivateGameState(
      { gameId: params.gameId, playerId: params.playerId },
      callback
    );
  }
};
