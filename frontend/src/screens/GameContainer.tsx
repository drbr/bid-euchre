import { useEffect, useState } from 'react';
import {
  PublicGameConfig,
  PublicGameState,
} from '../../../functions/apiContract/database/DataModel';
import * as DAO from '../firebase/FrontendDAO';
import { JoinGame } from './JoinGame';
import { GameNotFound } from './GameNotFound';
import {
  PlayerInfoStorage,
  retrievePlayerInfoForGame,
  storePlayerInfoForGame,
} from '../uiHelpers/LocalStorageClient';
import { Position } from '../../../functions/apiContract/database/GameState';
import { joinGame } from '../firebase/CloudFunctionsClient';
import { PlayGame } from './PlayGame';

export type GameContainerProps = {
  gameId: string;
};

export function GameContainer(props: GameContainerProps) {
  const [gameConfig, setGameConfig] = useState<
    PublicGameConfig | undefined | 'gameNotFound'
  >(undefined);
  useEffect(() => {
    return DAO.subscribeToPublicGameConfig(props.gameId, (gameConfig) =>
      setGameConfig(gameConfig ?? 'gameNotFound')
    );
  }, [props.gameId]);

  const [publicGameState, setPublicGameState] = useState<
    PublicGameState | undefined | 'gameNotFound'
  >(undefined);
  useEffect(() => {
    return DAO.subscribeToPublicGameState(props.gameId, (gameState) =>
      setPublicGameState(gameState ?? 'gameNotFound')
    );
  }, [props.gameId]);

  const [playerInfoFromStorage, setPlayerInfoFromStorage] = useState<
    PlayerInfoStorage | 'gameNotFound'
  >(
    () => retrievePlayerInfoForGame({ gameId: props.gameId }) || 'gameNotFound'
  );

  async function joinGameAtPosition(args: {
    playerName: string;
    position: Position;
  }) {
    const { playerName, position } = args;
    try {
      const joinGameResult = await joinGame({
        friendlyName: playerName,
        gameId: props.gameId,
        position: position,
      });

      storePlayerInfoForGame(joinGameResult);
      setPlayerInfoFromStorage(joinGameResult);
    } catch (e) {
      alert(`Could not join game. Please try again.`);
    }
  }

  if (gameConfig === undefined || publicGameState === undefined) {
    // Still loading the initial values
    return <></>;
  }

  if (gameConfig === 'gameNotFound') {
    return <GameNotFound />;
  }

  if (publicGameState === 'gameNotFound') {
    return (
      <JoinGame
        gameId={props.gameId}
        joinGameAtPosition={joinGameAtPosition}
        seatedAt={
          isSpectator(playerInfoFromStorage)
            ? undefined
            : playerInfoFromStorage.position
        }
        {...gameConfig}
      />
    );
  } else {
    /* Add stuff to the window for debugging */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (window as any).gameConfig = gameConfig;
    (window as any).publicGameState = publicGameState;
    (window as any).playerInfoFromStorage = playerInfoFromStorage;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    return (
      <div>
        <PlayGame
          gameId={props.gameId}
          playerId={
            isSpectator(playerInfoFromStorage)
              ? null
              : playerInfoFromStorage.playerId
          }
          gameConfig={gameConfig}
          publicGameState={publicGameState}
          seatedAt={
            isSpectator(playerInfoFromStorage)
              ? 'south'
              : playerInfoFromStorage.position
          }
        />
      </div>
    );
  }
}

function isSpectator(
  info: PlayerInfoStorage | 'gameNotFound'
): info is 'gameNotFound' {
  return info === 'gameNotFound';
}
