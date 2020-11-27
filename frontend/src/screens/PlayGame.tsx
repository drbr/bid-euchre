import { AnyEventObject } from 'xstate';
import { PublicGameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { sendGameEvent } from '../firebase/CloudFunctionsClient';
import * as DAO from '../firebase/FrontendDAO';
import { GameState } from '../gameLogic/stateMachine/GameStateTypes';
import { useObservedState } from '../uiHelpers/useObservedState';
import { GameLayout } from './GameLayout';

export type PlayGameProps = {
  gameId: string;
  playerId: string | null;
  gameConfig: PublicGameConfig;
  gameState: GameState;
  seatedAt: Position;
};

export function PlayGame(props: PlayGameProps) {
  const privateGameState = useObservedState(
    { gameId: props.gameId, playerId: props.playerId },
    (params, callback) => {
      if (params.playerId) {
        return DAO.subscribeToPrivateGameState(
          params as { gameId: string; playerId: string },
          callback
        );
      }
    }
  );

  function sendEvent(event: AnyEventObject) {
    void sendGameEvent({
      event,
      existingEventCount: props.gameState.context.eventCount,
      gameId: props.gameId,
      playerId: props.playerId,
    });
  }

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).privateGameState = privateGameState;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div>
      <p>
        {props.playerId ? null : 'You are a spectator of the current game!'}
      </p>
      <GameLayout
        renderPlayerElement={(position) => (
          <div>{props.gameConfig.playerFriendlyNames[position]}</div>
        )}
        tableCenterElement={
          <div>
            <p>Event count: {props.gameState.context.eventCount}</p>
            <button onClick={() => sendEvent({ type: 'NEXT' })}>
              Send Next Event
            </button>
          </div>
        }
        viewpoint={props.seatedAt}
      />
    </div>
  );
}
