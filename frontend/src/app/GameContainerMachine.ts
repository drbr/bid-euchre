import { actions, assign, DoneInvokeEvent, Machine } from 'xstate';
import { GameConfig } from '../gameLogic/apiContract/database/DataModel';
import { PlayerInfoStorage } from '../uiHelpers/LocalStorageClient';
import { UIActions } from '../uiHelpers/UIActions';
import {
  GameContainerContext,

  GameContainerEvent,
  GameContainerInitialContext, GameContainerStateSchema
} from './GameContainerMachineTypes';

export const GameContainerMachine = Machine<
  GameContainerContext,
  GameContainerStateSchema,
  GameContainerEvent
>(
  {
    id: 'GameContainerMachine',
    strict: true,
    initial: 'joinNotInProgress',
    context: GameContainerInitialContext,
    states: {
      joinNotInProgress: {
        on: {
          UPDATE_GAME_CONFIG: {
            actions: assign({
              displayedGameConfig: (context, event) => event.gameConfig,
            }),
          },
          UPDATE_PLAYER_INFO: {
            actions: assign({
              displayedPlayerInfo: (context, event) => event.playerInfo,
            }),
          },
          START_JOIN: { target: 'joinInProgress' },
        },
      },
      joinInProgress: {
        onDone: {
          target: 'joinNotInProgress',
          actions: 'displayLatestData',
        },
        on: {
          UPDATE_GAME_CONFIG: {
            actions: assign({
              latestGameConfig: (context, event) => event.gameConfig,
            }),
          },
          UPDATE_PLAYER_INFO: {
            actions: assign({
              latestPlayerInfo: (context, event) => event.playerInfo,
            }),
          },
        },
        initial: 'makeApiCall',
        states: {
          makeApiCall: {
            invoke: {
              id: 'callJoinGameApi',
              src: 'callJoinGameApiAndStoreResult',
              onDone: {
                target: 'waitForDataToSync',
              },
              onError: {
                target: '#GameContainerMachine.joinNotInProgress',
                actions: [
                  'displayLatestData',
                  actions.pure((context, event) => ({
                    type: 'uiAlert',
                    error: event.data,
                    message: 'Could not join game. See log for details.',
                  })),
                ],
              },
            },
          },
          waitForDataToSync: {
            always: {
              target: 'complete',
              cond: 'isPlayerDataInGameConfig',
            },
          },
          complete: { type: 'final' },
        },
      },
    },
  },
  {
    actions: {
      displayLatestData: assign({
        displayedGameConfig: (context) =>
          context.latestGameConfig ?? context.displayedGameConfig,
        displayedPlayerInfo: (context) =>
          context.latestPlayerInfo ?? context.displayedPlayerInfo,
        latestGameConfig: (context) => undefined,
        latestPlayerInfo: (context) => undefined,
      }),
      uiAlert: (context, event, meta) =>
        UIActions.showErrorAlert(
          ((event as unknown) as DoneInvokeEvent<unknown>).data,
          {
            message: meta.action.message,
          }
        ),
    },
    guards: {
      isPlayerDataInGameConfig: (context) => {
        const playerInfo = getPlayerInfo(context);
        const gameConfig = getGameConfig(context);
        if (playerInfo && gameConfig) {
          const pos = playerInfo.position;
          return (
            gameConfig.playerFriendlyNames[pos] === playerInfo.friendlyName
          );
        } else {
          return false;
        }
      },
    },
  }
);

function getPlayerInfo(
  context: GameContainerContext
): PlayerInfoStorage | null {
  const playerInfo = context.latestPlayerInfo ?? context.displayedPlayerInfo;
  if (playerInfo !== 'gameNotFound' && playerInfo !== 'loading') {
    return playerInfo;
  } else {
    return null;
  }
}

function getGameConfig(context: GameContainerContext): GameConfig | null {
  const gameConfig = context.latestGameConfig ?? context.displayedGameConfig;
  if (gameConfig !== 'gameNotFound' && gameConfig !== 'loading') {
    return gameConfig;
  } else {
    return null;
  }
}
