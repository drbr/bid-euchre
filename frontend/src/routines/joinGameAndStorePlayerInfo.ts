import * as FunctionsClient from '../firebase/CloudFunctionsClient';
import { Position } from '../../../functions/apiContract/database/GameState';
import { PlayerInfoStorage } from '../uiHelpers/LocalStorageClient';
import { UIActions } from '../uiHelpers/UIActions';
import { GameConfig } from '../../../functions/apiContract/database/DataModel';
import { ObservedState } from '../uiHelpers/useObservedState';
import { TypedStateSchema } from '../gameLogic/stateMachineUtils/TypedStateInterfaces';
import { actions, assign, DoneInvokeEvent, Machine } from 'xstate';

export type GameContainerContext = {
  displayedGameConfig: ObservedState<GameConfig>;
  displayedPlayerInfo: ObservedState<PlayerInfoStorage>;
  latestGameConfig?: ObservedState<GameConfig>;
  latestPlayerInfo?: ObservedState<PlayerInfoStorage>;
};

export type GameContainerStatesGeneric<T> = {
  joinNotInProgress: T; // user may or may not be already joined
  joinInProgress: {
    states: {
      apiCall: {
        states: {
          start: T;
          complete: T;
        };
      };
      watchPlayerInfo: {
        states: {
          wait: T;
          complete: T;
        };
      };
      watchGameConfig: {
        states: {
          wait: T;
          complete: T;
        };
      };
    };
  };
};

export type GameContainerStateSchema = {
  states: GameContainerStatesGeneric<
    TypedStateSchema<unknown, GameContainerContext>
  >;
};

export type StartJoinEvent = {
  type: 'startJoin';
  gameId: string;
  playerName: string;
  position: Position;
};

export type GameContainerEvent =
  | StartJoinEvent
  | { type: 'updateGameConfig'; gameConfig: ObservedState<GameConfig> }
  | { type: 'updatePlayerInfo'; playerInfo: ObservedState<PlayerInfoStorage> };

export const GameContainerInitialContext: GameContainerContext = {
  displayedGameConfig: 'loading',
  displayedPlayerInfo: 'loading',
};

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
          updateGameConfig: {
            actions: assign({
              displayedGameConfig: (context, event) => event.gameConfig,
            }),
          },
          updatePlayerInfo: {
            actions: assign({
              displayedPlayerInfo: (context, event) => event.playerInfo,
            }),
          },
          startJoin: { target: 'joinInProgress' },
        },
      },
      joinInProgress: {
        type: 'parallel',
        onDone: {
          target: 'joinNotInProgress',
          actions: 'resetDisplayedData',
        },
        on: {
          updateGameConfig: {
            actions: assign({
              latestGameConfig: (context, event) => event.gameConfig,
            }),
          },
          updatePlayerInfo: {
            actions: assign({
              latestPlayerInfo: (context, event) => event.playerInfo,
            }),
          },
        },
        states: {
          apiCall: {
            initial: 'start',
            invoke: {
              id: 'sendJoinGameEvent',
              src: (context, ev) => {
                const event = ev as StartJoinEvent;
                return FunctionsClient.joinGame({
                  friendlyName: event.playerName,
                  gameId: event.gameId,
                  position: event.position,
                });
              },
              onDone: {
                target: 'complete',
                actions: 'storeResult',
              },
              onError: {
                target: '#GameContainerMachine.joinNotInProgress',
                actions: [
                  'resetDisplayedData',
                  actions.pure((context, event) => ({
                    type: 'uiAlert',
                    error: event.data,
                    message: 'Could not join game. See log for details.',
                  })),
                ],
              },
            },
            states: {
              start: {},
              complete: { type: 'final' },
            },
          },
          watchPlayerInfo: {
            initial: 'wait',
            states: {
              wait: {
                always: {
                  target: 'complete',
                  cond: 'isPlayerInfoPresent',
                },
              },
              complete: { type: 'final' },
            },
          },
          watchGameConfig: {
            initial: 'wait',
            states: {
              wait: {
                always: {
                  target: 'complete',
                  cond: 'isPlayerNameInGameConfig',
                },
              },
              complete: { type: 'final' },
            },
          },
        },
      },
    },
  },
  {
    actions: {
      resetDisplayedData: assign({
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
      isPlayerInfoPresent: (context) => !!getPlayerInfo(context),
      isPlayerNameInGameConfig: (context) => {
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
