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
import { InProgressGameConfig } from '../../../functions/apiContract/database/DataModel';

export type GameContainerProps = {
  gameId: string;
};

export function GameContainer(props: GameContainerProps) {
  const { gameId } = props;

  const gameConfig = useObservedState(
    { gameId },
    DAO.subscribeToGameConfig
  );

  const [playerInfoFromStorage, setPlayerInfoFromStorage] = useState<
    PlayerInfoStorage | 'gameNotFound'
  >(() => retrievePlayerInfoForGame({ gameId }) || 'gameNotFound');

  if (gameConfig === 'loading') {
    return <></>;
  }

  if (gameConfig === 'gameNotFound') {
    return <GameNotFound />;
  }

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).gameConfig = gameConfig;
  (window as any).playerInfoFromStorage = playerInfoFromStorage;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const seatedAt = isSpectator(playerInfoFromStorage)
    ? null
    : playerInfoFromStorage.position;
  const playerId = isSpectator(playerInfoFromStorage)
    ? null
    : playerInfoFromStorage.playerId;

  if (gameConfig.gameStatus === 'waitingToStart') {
    return (
      <JoinGame
        gameId={props.gameId}
        gameConfig={gameConfig}
        seatedAt={seatedAt}
        setPlayerInfoFromStorage={setPlayerInfoFromStorage}
      />
    );
  } else {
    return (
      <PlayGame
        gameId={props.gameId}
        gameConfig={gameConfig as InProgressGameConfig}
        seatedAt={seatedAt}
        playerId={playerId}
      />
    );
  }
}

function isSpectator(
  info: PlayerInfoStorage | 'gameNotFound'
): info is 'gameNotFound' {
  return info === 'gameNotFound';
}
