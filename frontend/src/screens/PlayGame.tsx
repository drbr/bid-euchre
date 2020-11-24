import { useEffect, useState } from 'react';
import {
  PlayerPrivateGameState,
  PublicGameConfig,
  PublicGameState,
} from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { GameLayout } from './GameLayout';
import * as DAO from '../firebase/FrontendDAO';
import { mapGameConfig } from '../gameLogic/ModelMappers';

export type PlayGameProps = {
  gameId: string;
  playerId: string | null;
  gameConfig: PublicGameConfig;
  publicGameState: PublicGameState;
  seatedAt: Position;
};

export function PlayGame(props: PlayGameProps) {
  const [privateGameState, setPrivateGameState] = useState<
    PlayerPrivateGameState | undefined | 'gameNotFound'
  >(undefined);
  useEffect(() => {
    if (props.playerId) {
      return DAO.subscribeToPrivateGameState(
        { gameId: props.gameId, playerId: props.playerId },
        (gameState) => setPrivateGameState(gameState ?? 'gameNotFound')
      );
    }
  }, [props.gameId, props.playerId]);

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
