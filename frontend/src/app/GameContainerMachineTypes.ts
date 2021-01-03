import { Position } from '../../../functions/apiContract/database/GameState';
import { PlayerInfoStorage } from '../uiHelpers/LocalStorageClient';
import { GameConfig } from '../../../functions/apiContract/database/DataModel';
import { ObservedState } from '../uiHelpers/useObservedState';
import { TypedStateSchema } from '../gameLogic/stateMachineUtils/TypedStateInterfaces';

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
      makeApiCall: T;
      waitForDataToSync: T;
      complete: T;
    };
  };
};

export type GameContainerStateSchema = {
  states: GameContainerStatesGeneric<
    TypedStateSchema<unknown, GameContainerContext>
  >;
};

export type StartJoinEvent = {
  type: 'START_JOIN';
  gameId: string;
  playerName: string;
  position: Position;
};

export type GameContainerEvent =
  | StartJoinEvent
  | { type: 'UPDATE_GAME_CONFIG'; gameConfig: ObservedState<GameConfig> }
  | {
      type: 'UPDATE_PLAYER_INFO';
      playerInfo: ObservedState<PlayerInfoStorage>;
    };

export const GameContainerInitialContext: GameContainerContext = {
  displayedGameConfig: 'loading',
  displayedPlayerInfo: 'loading',
};
