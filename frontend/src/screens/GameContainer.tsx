import { useState } from 'react';
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
import { useObservedState } from '../uiHelpers/useObservedState';

export type GameContainerProps = {
  gameId: string;
};

export function GameContainer(props: GameContainerProps) {
  const { gameId } = props;

  const gameConfig = useObservedState(
    { gameId },
    DAO.subscribeToPublicGameConfig
  );

  // const publicGameState = useObservedState(
  //   { gameId },
  //   DAO.subscribeToPublicGameState
  // );

  const gameMachineState = useObservedState(
    { gameId },
    DAO.subscribeToPublicGameStateJson
  );

  const [playerInfoFromStorage, setPlayerInfoFromStorage] = useState<
    PlayerInfoStorage | 'gameNotFound'
  >(() => retrievePlayerInfoForGame({ gameId }) || 'gameNotFound');

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
      // TODO: Change this to an element from the UI library
      alert(`Could not join game. Please try again.`);
    }
  }

  if (
    gameConfig === 'loading' ||
    // publicGameState === 'loading' ||
    gameMachineState === 'loading'
  ) {
    return <></>;
  }

  if (gameConfig === 'gameNotFound') {
    return <GameNotFound />;
  }

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).gameConfig = gameConfig;
  // (window as any).publicGameState = publicGameState;
  (window as any).gameMachineState = gameMachineState;
  (window as any).playerInfoFromStorage = playerInfoFromStorage;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (gameMachineState === 'gameNotFound') {
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
    return (
      <PlayGame
        gameId={props.gameId}
        playerId={
          isSpectator(playerInfoFromStorage)
            ? null
            : playerInfoFromStorage.playerId
        }
        seatedAt={
          isSpectator(playerInfoFromStorage)
            ? 'south'
            : playerInfoFromStorage.position
        }
        gameConfig={gameConfig}
        gameState={gameMachineState}
      />
    );
  }
}

function isSpectator(
  info: PlayerInfoStorage | 'gameNotFound'
): info is 'gameNotFound' {
  return info === 'gameNotFound';
}
