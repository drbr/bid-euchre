import React, { useEffect } from 'react';
import {
  BiddingContext,
  BiddingEvent,
  BiddingStateNames,
} from '../gameLogic/euchreStateMachine/BiddingStateTypes';
import { GameContext } from '../gameLogic/euchreStateMachine/GameStateTypes';
import { RoundContextAlways } from '../gameLogic/euchreStateMachine/RoundStateTypes';
import { getScopedValueString } from '../gameLogic/stateMachineUtils/getScopedValue';
import { assertUnreachable } from '../uiHelpers/TypescriptUtils';
import {
  AllPlayersPassedInfo,
  PlayerNamedTrumpInfo,
} from './BiddingDisplayInfoStates';
import { BiddingDisplayNameTrump } from './BiddingDisplayNameTrump';
import { BiddingDisplayPlayerBid } from './BiddingDisplayPlayerBid';
import { TransientState } from './components/TransientState';
import {
  ScopedGameDisplayProps,
  UnscopedGameDisplayProps,
} from './GameDisplayProps';

export type BiddingDisplayProps = ScopedGameDisplayProps<
  BiddingContext & RoundContextAlways & GameContext,
  BiddingEvent
> &
  UnscopedGameDisplayProps;

export function BiddingDisplayDelegator(
  props: BiddingDisplayProps
): JSX.Element {
  const substate: BiddingStateNames = getScopedValueString(
    props.stateValue,
    'runGame',
    'round',
    'bidding'
  );
  useEffect(() => {
    console.debug(`In Bidding Display: substate is ${substate}`);
  }, [substate]);

  switch (substate) {
    case 'waitForPlayerToBid':
      return <BiddingDisplayPlayerBid {...props} />;
    case 'allPlayersPassedInfo':
      return <AllPlayersPassedInfo {...props} />;
    case 'waitForPlayerToNameTrump':
      return <BiddingDisplayNameTrump {...props} />;
    case 'playerNamedTrumpInfo':
      return <PlayerNamedTrumpInfo {...props} />;
    case 'checkIfAllPlayersHaveBid':
    case 'checkWinningBidder':
    case 'complete':
      return <TransientState substateName={substate} />;
    default:
      assertUnreachable(substate);
      return <></>;
  }
}
