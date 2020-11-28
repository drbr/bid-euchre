import { useEffect } from 'react';
import {
  RoundContext,
  RoundEvent,
  RoundState,
  RoundStateNames,
} from '../gameLogic/stateMachine/RoundStateTypes';
import { getScopedValueString } from '../gameLogic/StateMachineHelpers';
import { assertUnreachable } from '../uiHelpers/TypescriptUtils';
import { BiddingDisplay, BiddingDisplayProps } from './BiddingDisplay';
import {
  ScopedGameDisplayProps,
  UnscopedGameDisplayProps,
} from './GameDisplay';
import { TransientState } from './TransientState';

export type RoundDisplayProps = ScopedGameDisplayProps<
  RoundContext,
  RoundEvent,
  RoundState
> &
  UnscopedGameDisplayProps;

export function RoundDisplay(props: RoundDisplayProps): JSX.Element {
  const substate: RoundStateNames = getScopedValueString(
    props.machineState,
    'runGame',
    'round'
  );
  useEffect(() => {
    console.debug(`In Round Display: substate is ${substate}`);
  }, [substate]);

  switch (substate) {
    case 'bidding':
      return (
        <BiddingDisplay {...((props as unknown) as BiddingDisplayProps)} />
      );
    case 'checkWinningBidder':
    case 'dealHands':
    case 'roundComplete':
    case 'scoring':
    case 'thePlay':
    case 'nameTrump':
      return <TransientState substateName={substate} />;
    default:
      assertUnreachable(substate);
      return <></>;
  }
}
