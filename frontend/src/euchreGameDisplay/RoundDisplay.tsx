import { useEffect } from 'react';
import { GameContext } from '../gameLogic/euchreStateMachine/GameStateTypes';
import {
  RoundContext,
  RoundEvent,
  RoundStateNames,
} from '../gameLogic/euchreStateMachine/RoundStateTypes';
import { getScopedValueString } from '../gameLogic/stateMachineUtils/getScopedValue';
import { assertUnreachable } from '../uiHelpers/TypescriptUtils';
import { BiddingDisplay, BiddingDisplayProps } from './BiddingDisplay';
import {
  ScopedGameDisplayProps,
  UnscopedGameDisplayProps,
} from './GameDisplay';
import { DealDisplay } from './DealDisplay';
import { NameTrumpDisplay } from './NameTrumpDisplay';
import { TransientState } from './TransientState';

export type RoundDisplayProps = ScopedGameDisplayProps<
  RoundContext & GameContext,
  RoundEvent
> &
  UnscopedGameDisplayProps;

export function RoundDisplay(props: RoundDisplayProps): JSX.Element {
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
      return <DealDisplay {...props} />;
    case 'bidding':
      return (
        <BiddingDisplay {...((props as unknown) as BiddingDisplayProps)} />
      );
    case 'waitForPlayerToNameTrump':
      return <NameTrumpDisplay {...props} />;
    case 'checkWinningBidder':
    case 'dealDone':
    case 'roundComplete':
    case 'scoring':
    case 'thePlay':
      return <TransientState substateName={substate} />;
    default:
      assertUnreachable(substate);
      return <></>;
  }
}
