import { memo, useEffect } from 'react';
import {
  GameContext,
  GameEvent,
  GameStateNames,
} from '../gameLogic/euchreStateMachine/GameStateTypes';
import { getScopedValueString } from '../gameLogic/stateMachineUtils/getScopedValue';
import { assertUnreachable } from '../uiHelpers/TypescriptUtils';
import { TransientState } from './components/TransientState';
import { RoundCompleteInfo } from './GameDisplayInfoStates';
import {
  ScopedGameDisplayProps,
  UnscopedGameDisplayProps,
} from './GameDisplayProps';
import {
  RoundDisplayDelegator,
  RoundDisplayProps,
} from './RoundDisplayDelegator';

export type GameDisplayProps = ScopedGameDisplayProps<GameContext, GameEvent> &
  UnscopedGameDisplayProps;

export const GameDisplayDelegatorPure = memo(function GameDisplayDelegator(
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
      return (
        <RoundDisplayDelegator {...((props as unknown) as RoundDisplayProps)} />
      );
    case 'roundCompleteInfo':
    case 'gameCompleteInfo':
      return <RoundCompleteInfo {...props} />;
    case 'entry':
    case 'checkIfGameIsWon':
      return <TransientState substateName={substate} />;
    default:
      assertUnreachable(substate);
      return <></>;
  }
});
