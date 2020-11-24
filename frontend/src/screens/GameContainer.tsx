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
      setFetchedPlayerInfo(joinGameResult);
    } catch (e) {
      alert(`Could not join game. Please try again.`);
    }
  }

  if (fetchedGameConfig === undefined || fetchedGameState === undefined) {
    // Still loading the initial values
    return <></>;
  }

  if (fetchedGameConfig === 'gameNotFound') {
    return <GameNotFound />;
  }

  if (fetchedGameState === 'gameNotFound') {
    return (
      <JoinGame
        gameId={props.gameId}
        joinGameAtPosition={joinGameAtPosition}
        seatedAt={
          fetchedPlayerInfo === 'gameNotFound'
            ? undefined
            : fetchedPlayerInfo.position
        }
        {...fetchedGameConfig}
      />
    );
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
