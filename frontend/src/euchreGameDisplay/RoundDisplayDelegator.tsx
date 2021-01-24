import { useEffect } from 'react';
import { GameContext } from '../gameLogic/euchreStateMachine/GameStateTypes';
import {
  RoundContext,
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

export type RoundDisplayProps = ScopedGameDisplayProps<
  RoundContext & GameContext,
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
    case 'dealDone':
    case 'roundComplete':
    case 'thePlay':
    case 'scoring':
      return <TransientState substateName={substate} />;
    default:
      assertUnreachable(substate);
      return <></>;
  }
}
