import { Position } from '../../../../functions/apiContract/database/GameState';

export type PlayerSpecificEvent = {
  position?: Position;
};

export type StartGameEvent = {
  type: 'START_GAME';
};

export type PrivateActionCompleteEvent = {
  type: 'PRIVATE_ACTION_COMPLETE';
};

export const PrivateActionCompleteEventType: PrivateActionCompleteEvent['type'] =
  'PRIVATE_ACTION_COMPLETE';
