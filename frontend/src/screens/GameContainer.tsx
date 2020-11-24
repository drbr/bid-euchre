import { useEffect, useState } from 'react';
import {
  PublicGameConfig,
  PublicGameState,
} from '../../../functions/apiContract/database/DataModel';
import * as DAO from '../firebase/ReadDAO';
import { JoinGame } from './JoinGame';
import { GameNotFound } from './GameNotFound';
import {
  PlayerInfoStorage,
  retrievePlayerInfoForGame,
  storePlayerInfoForGame,
} from '../uiHelpers/LocalStorageClient';

export type GameContainerProps = {
  gameId: string;
};

export function GameContainer(props: GameContainerProps) {
  const [fetchedGameConfig, setFetchedGameConfig] = useState<
    PublicGameConfig | undefined | 'gameNotFound'
  >(undefined);
  useEffect(() => {
    return DAO.subscribeToPublicGameConfig(props.gameId, (gameConfig) =>
      setFetchedGameConfig(gameConfig ?? 'gameNotFound')
    );
  }, [props.gameId]);

  const [fetchedGameState, setFetchedGameState] = useState<
    PublicGameState | undefined | 'gameNotFound'
  >(undefined);
  useEffect(() => {
    return DAO.subscribeToPublicGameState(props.gameId, (gameState) =>
      setFetchedGameState(gameState ?? 'gameNotFound')
    );
  }, [props.gameId]);

  const [fetchedPlayerInfo, setFetchedPlayerInfo] = useState<
    PlayerInfoStorage | 'gameNotFound'
  >(
    () => retrievePlayerInfoForGame({ gameId: props.gameId }) || 'gameNotFound'
  );

  if (fetchedGameConfig === undefined || fetchedGameState === undefined) {
    // Still loading the initial values
    return <></>;
  }

  if (fetchedGameConfig === 'gameNotFound') {
    return <GameNotFound />;
  }

  if (fetchedGameState === 'gameNotFound') {
    if (fetchedPlayerInfo === 'gameNotFound') {
      return (
        <JoinGame
          gameId={props.gameId}
          updatePlayerInfo={(playerInfoWithGameId) => {
            storePlayerInfoForGame(playerInfoWithGameId);
            setFetchedPlayerInfo(playerInfoWithGameId);
          }}
          {...fetchedGameConfig}
        />
      );
    } else {
      return <div>Waiting for others to join the game…</div>;
    }
  } else {
    if (fetchedPlayerInfo === 'gameNotFound') {
      return <div>You are a spectator of the current in-progress game!</div>;
    } else {
      return (
        <div>
          You are now playing the game! {JSON.stringify(fetchedPlayerInfo)}
        </div>
      );
    }
  }
}
