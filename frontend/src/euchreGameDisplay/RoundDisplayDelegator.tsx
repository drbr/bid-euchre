import { useEffect } from 'react';
import { GameContext } from '../gameLogic/euchreStateMachine/GameStateTypes';
import {
  RoundContextAlways,
  RoundEvent,
  RoundStateNames,
} from '../gameLogic/euchreStateMachine/RoundStateTypes';
import { getScopedValueString } from '../gameLogic/stateMachineUtils/getScopedValue';
import { assertUnreachable } from '../uiHelpers/TypescriptUtils';
import { TransientState } from './components/TransientState';
import {
  ScopedGameDisplayProps,
  UnscopedGameDisplayProps,
} from './GameDisplayProps';
import { RoundDisplayDeal } from './RoundDisplayDeal';
import {
  BiddingDisplayDelegator,
  BiddingDisplayProps,
} from './BiddingDisplayDelegator';
import {
  ThePlayDisplayDelegator,
  ThePlayDisplayProps,
} from './ThePlayDisplayDelegator';

export type RoundDisplayProps = ScopedGameDisplayProps<
  RoundContextAlways & GameContext,
  RoundEvent
> &
  UnscopedGameDisplayProps;

export function RoundDisplayDelegator(props: RoundDisplayProps): JSX.Element {
  const substate: RoundStateNames = getScopedValueString(
    props.stateValue,
    'runGame',
    'round'
  );
  useEffect(() => {
    console.debug(`In Round Display: substate is ${substate}`);
  }, [substate]);

  switch (substate) {
    case 'waitForDeal':
      return <RoundDisplayDeal {...props} />;
    case 'bidding':
      return (
        <BiddingDisplayDelegator
          {...((props as unknown) as BiddingDisplayProps)}
        />
      );
    case 'thePlay':
      return (
        <ThePlayDisplayDelegator
          {...((props as unknown) as ThePlayDisplayProps)}
        />
      );
    case 'doDeal':
    case 'dealDone':
    case 'roundComplete':
    case 'scoring':
      return <TransientState substateName={substate} />;
    default:
      assertUnreachable(substate);
      return <></>;
  }
}
