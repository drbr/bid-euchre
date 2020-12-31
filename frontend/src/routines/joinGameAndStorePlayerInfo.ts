import * as FunctionsClient from '../firebase/CloudFunctionsClient';
import { Position } from '../../../functions/apiContract/database/GameState';
import { PlayerInfoStorage } from '../uiHelpers/LocalStorageClient';
import { UIActions } from '../uiHelpers/UIActions';
import { GameConfig } from '../../../functions/apiContract/database/DataModel';
import { ObservedState } from '../uiHelpers/useObservedState';
import { TypedStateSchema } from '../gameLogic/stateMachineUtils/TypedStateInterfaces';
import { assign, Machine } from 'xstate';

export async function joinGameAndStorePlayerInfo(args: {
  gameId: string;
  playerName: string;
  position: Position;
  storePlayerInfo: (x: PlayerInfoStorage) => void;
}) {
  const { playerName, position, gameId, storePlayerInfo } = args;
  try {
    const joinGameResult = await FunctionsClient.joinGame({
      friendlyName: playerName,
      gameId: gameId,
      position: position,
    });

    storePlayerInfo(joinGameResult);
  } catch (e) {
    UIActions.showErrorAlert(e, {
      message: 'Could not join game. See log for details.',
    });
  }
}

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
      watchApiCall: {
        states: {
          wait: T;
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

export type GameContainerEvent =
  | { type: 'startJoining' }
  | { type: 'joinApiComplete' }
  | { type: 'joinApiFailed' }
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
          startJoining: 'joinInProgress',
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
          watchApiCall: {
            initial: 'wait',
            states: {
              wait: {
                on: {
                  joinApiComplete: 'complete',
                  joinApiFailed: {
                    target: '#GameContainerMachine.joinNotInProgress',
                    actions: 'resetDisplayedData',
                  },
                },
              },
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
