import { GameConfig } from '../gameLogic/apiContract/database/DataModel';
import { Position } from "../gameLogic/apiContract/database/Position";
import { TypedStateSchema } from '../gameLogic/stateMachineUtils/TypedStateInterfaces';
import { PlayerInfoStorage } from '../uiHelpers/LocalStorageClient';
import { ObservedState } from '../uiHelpers/useObservedState';

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
