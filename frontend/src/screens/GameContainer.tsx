import { useState } from 'react';
import * as DAO from '../firebase/FrontendDAO';
import { JoinGame } from './JoinGame';
import { GameNotFound } from './GameNotFound';
import {
  PlayerInfoStorage,
  retrievePlayerInfoForGame,
} from '../uiHelpers/LocalStorageClient';
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
    DAO.subscribeToPublicGameStateJson,
    (prev, next) => {
      const prevCount = prev.context.eventCount;
      const nextCount = next.context.eventCount;
      console.log(next.value);
      if (nextCount !== prevCount + 1) {
        console.warn(
          `Possible error in state machine; trying to update game state from event count ${prevCount} to ${nextCount}`
        );
        console.log('Previous state:');
        console.log(prev);
        console.log('Next state:');
        console.log(next);
      }
      return true;
    }
  );

  const [playerInfoFromStorage, setPlayerInfoFromStorage] = useState<
    PlayerInfoStorage | 'gameNotFound'
  >(() => retrievePlayerInfoForGame({ gameId }) || 'gameNotFound');

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
        setPlayerInfoFromStorage={setPlayerInfoFromStorage}
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
