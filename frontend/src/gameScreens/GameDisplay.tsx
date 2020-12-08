import { useEffect } from 'react';
import { EventObject, State } from 'xstate';
import { InProgressGameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import {
  GameContext,
  GameEvent,
  GameState,
  GameStateNames,
} from '../gameLogic/euchreStateMachine/GameStateTypes';
import { getScopedValueString } from '../gameLogic/stateMachineUtils/getScopedValue';
import { assertUnreachable } from '../uiHelpers/TypescriptUtils';
import { RoundDisplay, RoundDisplayProps } from './RoundDisplay';
import { TransientState } from './TransientState';

export type ScopedGameDisplayProps<
  C,
  E extends EventObject,
  S extends State<C, E>
> = {
  machineState: S;
  machineContext: C;
  sendGameEvent: (event: E) => void;
};

export type UnscopedGameDisplayProps = {
  gameConfig: InProgressGameConfig;
  seatedAt: Position | null;
};

type GameDisplayProps = ScopedGameDisplayProps<
  GameContext,
  GameEvent,
  GameState
> &
  UnscopedGameDisplayProps;

export function GameDisplay(props: GameDisplayProps): JSX.Element {
  const substate: GameStateNames = getScopedValueString(
    props.machineState,
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
}
