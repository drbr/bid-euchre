import {
  PublicGameConfig
} from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
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
        tableCenterElement={null}
        viewpoint={props.seatedAt}
      />
    </div>
  );
}
