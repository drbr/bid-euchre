import { InProgressGameConfig } from '../../../functions/apiContract/database/DataModel';
import * as DAO from '../firebase/FrontendDAO';
import {
  PlayerInfoStorage,
  usePlayerInfoStorage,
} from '../uiHelpers/LocalStorageClient';
import { useObservedState } from '../uiHelpers/useObservedState';
import { GameNotFound } from './GameNotFound';
import { JoinGame } from './JoinGame';
import { PlayGame } from '../playGame/PlayGame';

export type GameContainerProps = {
  gameId: string;
};

export function GameContainer(props: GameContainerProps) {
  const { gameId } = props;

  const gameConfig = useObservedState({ gameId }, DAO.subscribeToGameConfig);

  const [playerInfoFromStorage, storePlayerInfo] = usePlayerInfoStorage({
    gameId,
  });

  if (gameConfig === 'loading') {
    return <div>Loading…</div>;
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
        storePlayerInfo={storePlayerInfo}
      />
    );
  } else {
    return (
      <PlayGame
        key={props.gameId} // Render fresh if we switch from one game to another
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
