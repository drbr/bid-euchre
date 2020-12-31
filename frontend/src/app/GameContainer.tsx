import {
  GameConfig,
  InProgressGameConfig,
} from '../../../functions/apiContract/database/DataModel';
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
  GameContainerStateSchema,
} from './GameContainerMachine';
import { useSubscription } from '../uiHelpers/useSubscription';
import { useMachine } from '@xstate/react';
import { useCallback, useEffect } from 'react';
import { DoneInvokeEvent, Interpreter } from 'xstate';
import { ObservedState } from '../uiHelpers/useObservedState';
import { JoinGameResult } from '../../../functions/apiContract/cloudFunctions/JoinGame';

export type GameContainerProps = {
  gameId: string;
};

type Send = Interpreter<
  GameContainerContext,
  GameContainerStateSchema,
  GameContainerEvent
>['send'];

export function GameContainer(props: GameContainerProps) {
  const { gameId } = props;

  // The state machine controls which iteration of playerInfo to display
  const [playerInfoDoNotUseDirectly, storePlayerInfo] = usePlayerInfoStorage({
    gameId,
  });

  const [machineState, send] = useMachine<
    GameContainerContext,
    GameContainerEvent
  >(GameContainerMachine, {
    actions: {
      storeResult: (context, ev) => {
        const event = (ev as unknown) as DoneInvokeEvent<JoinGameResult>;
        storePlayerInfo(event.data);
      },
    },
    devTools: true,
  });

  useSubscribeMachineToGameConfig({ gameId }, send);
  useSubscribeMachineToPlayerInfo(playerInfoDoNotUseDirectly, send);

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

function useSubscribeMachineToGameConfig(args: { gameId: string }, send: Send) {
  const setGameConfig = useCallback(
    (gameConfig: GameConfig | null) => {
      send({
        type: 'updateGameConfig',
        gameConfig: gameConfig ?? 'gameNotFound',
      });
    },
    [send]
  );

  useSubscription(
    { gameId: args.gameId },
    DAO.subscribeToGameConfig,
    setGameConfig
  );
}

function useSubscribeMachineToPlayerInfo(
  playerInfo: ObservedState<PlayerInfoStorage>,
  send: Send
) {
  useEffect(() => {
    send({
      type: 'updatePlayerInfo',
      playerInfo: playerInfo,
    });
  }, [send, playerInfo]);
}

function isSpectator(
  info: PlayerInfoStorage | 'gameNotFound'
): info is 'gameNotFound' {
  return info === 'gameNotFound';
}
