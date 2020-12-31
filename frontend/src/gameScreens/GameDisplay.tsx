import { memo, useEffect } from 'react';
import { EventObject, StateValue } from 'xstate';
import { InProgressGameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import {
  GameContext,
  GameEvent,
  GameStateNames,
} from '../gameLogic/euchreStateMachine/GameStateTypes';
import { getScopedValueString } from '../gameLogic/stateMachineUtils/getScopedValue';
import { assertUnreachable } from '../uiHelpers/TypescriptUtils';
import { RoundDisplay, RoundDisplayProps } from './RoundDisplay';
import { TransientState } from './TransientState';

/**
 * The "scoped" props are those whose types need to match the substate we're currently in.
 * At each level of the game display component hierarchy, we re-scope these types to correspond
 * to the context/event types at that level.
 */
export type ScopedGameDisplayProps<C, E extends EventObject> = {
  stateValue: StateValue;
  stateContext: C;
  sendGameEvent: (event: E) => void;
  isEventValid: (event: E) => boolean;
};

/** The "unscoped" props are the same no matter which state we're currently in. */
export type UnscopedGameDisplayProps = {
  gameConfig: InProgressGameConfig;
  seatedAt: Position | null;
};

type GameDisplayProps = ScopedGameDisplayProps<GameContext, GameEvent> &
  UnscopedGameDisplayProps;

export const GameDisplayPure = memo(function GameDisplay(
  props: GameDisplayProps
): JSX.Element {
  const substate: GameStateNames = getScopedValueString(
    props.stateValue,
    'runGame'
  );
  useEffect(() => {
    console.debug(`In Game Display: substate is ${substate}`);
  }, [substate]);

  switch (substate) {
    case 'round':
      return <RoundDisplay {...((props as unknown) as RoundDisplayProps)} />;
    case 'entry':
    case 'gameComplete':
      return <TransientState substateName={substate} />;
    default:
      assertUnreachable(substate);
      return <></>;
  }
});
