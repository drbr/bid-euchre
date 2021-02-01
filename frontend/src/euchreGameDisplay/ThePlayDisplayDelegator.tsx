import React, { useEffect } from 'react';
import {
  ThePlayContext,
  ThePlayEvent,
  ThePlayStateNames,
} from '../gameLogic/euchreStateMachine/ThePlayStateTypes';
import { GameContext } from '../gameLogic/euchreStateMachine/GameStateTypes';
import { RoundContextAfterBidding } from '../gameLogic/euchreStateMachine/RoundStateTypes';
import { getScopedValueString } from '../gameLogic/stateMachineUtils/getScopedValue';
import { assertUnreachable } from '../uiHelpers/TypescriptUtils';
import { TransientState } from './components/TransientState';
import {
  ScopedGameDisplayProps,
  UnscopedGameDisplayProps,
} from './GameDisplayProps';
import { TrickCompleteInfo } from './ThePlayDisplayInfoStates';
import { ThePlayDisplayTrick } from './ThePlayDisplayTrick';

export type ThePlayDisplayProps = ScopedGameDisplayProps<
  ThePlayContext & RoundContextAfterBidding & GameContext,
  ThePlayEvent
> &
  UnscopedGameDisplayProps;

export function ThePlayDisplayDelegator(
  props: ThePlayDisplayProps
): JSX.Element {
  const substate: ThePlayStateNames = getScopedValueString(
    props.stateValue,
    'runGame',
    'round',
    'thePlay'
  );
  useEffect(() => {
    console.debug(`In The Play Display: substate is ${substate}`);
  }, [substate]);

  switch (substate) {
    case 'trick':
      return <ThePlayDisplayTrick {...props} />;
    case 'trickCompleteInfo':
      return <TrickCompleteInfo {...props} />;
    case 'checkIfMoreTricksToPlay':
    case 'thePlayComplete':
      return <TransientState substateName={substate} />;
    default:
      assertUnreachable(substate);
      return <></>;
  }
}
