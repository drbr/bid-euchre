import { InProgressGameConfig } from '../../../functions/apiContract/database/DataModel';
import * as DAO from '../firebase/FrontendDAO';
import {
  PlayerInfoStorage,
  usePlayerInfoStorage,
} from '../uiHelpers/LocalStorageClient';
import { GameNotFound } from './GameNotFound';
import { DisplayPlayersJoining } from './DisplayPlayersJoining';
import { PlayGame } from '../playGame/PlayGame';
import {
  GameContainerContext,
  GameContainerEvent,
  GameContainerMachine,
} from './GameContainerMachine';
import { useSubscription } from '../uiHelpers/useSubscription';
import { useMachine } from '@xstate/react';
import { useEffect } from 'react';

export type GameContainerProps = {
  gameId: string;
};

export function GameContainer(props: GameContainerProps) {
  const { gameId } = props;

  const [machineState, send] = useMachine<
    GameContainerContext,
    GameContainerEvent
  >(GameContainerMachine);

  useSubscription({ gameId }, DAO.subscribeToGameConfig, (gameConfig) =>
    send({
      type: 'updateGameConfig',
      gameConfig: gameConfig ?? 'gameNotFound',
    })
  );

  const [_playerInfo, storePlayerInfo] = usePlayerInfoStorage({
    gameId,
  });

  useEffect(() => {
    send({
      type: 'updatePlayerInfo',
      playerInfo: _playerInfo,
    });
  }, [send, _playerInfo]);

  const { displayedGameConfig, displayedPlayerInfo } = machineState.context;

  if (displayedGameConfig === 'loading' || displayedPlayerInfo === 'loading') {
    return <div>Loading…</div>;
  }

  if (displayedGameConfig === 'gameNotFound') {
    return <GameNotFound />;
  }

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).gameConfig = displayedGameConfig;
  (window as any).playerInfoFromStorage = displayedPlayerInfo;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const seatedAt = isSpectator(displayedPlayerInfo)
    ? null
    : displayedPlayerInfo.position;
  const playerId = isSpectator(displayedPlayerInfo)
    ? null
    : displayedPlayerInfo.playerId;

  if (displayedGameConfig.gameStatus === 'waitingToStart') {
    return (
      <DisplayPlayersJoining
        gameId={props.gameId}
        gameConfig={displayedGameConfig}
        seatedAt={seatedAt}
        joinGameAtPosition={({ playerName, position }) => {
          send({
            type: 'startJoin',
            playerName,
            position,
            gameId,
          });
        }}
      />
    );
  } else {
    return (
      <PlayGame
        key={props.gameId} // Render fresh if we switch from one game to another
        gameId={props.gameId}
        gameConfig={displayedGameConfig as InProgressGameConfig}
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
