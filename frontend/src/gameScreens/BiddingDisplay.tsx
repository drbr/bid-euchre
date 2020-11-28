import * as React from 'react';
import FlexView from 'react-flexview/lib';
import {
  BiddingContext,
  BiddingEvent,
  BiddingState,
} from '../gameLogic/stateMachine/BiddingStateTypes';
import {
  ScopedGameDisplayProps,
  UnscopedGameDisplayProps,
} from './GameDisplay';
import { GameLayout } from './GameLayout';

export type BiddingDisplayProps = ScopedGameDisplayProps<
  BiddingContext,
  BiddingEvent,
  BiddingState
> &
  UnscopedGameDisplayProps;

export function BiddingDisplay(props: BiddingDisplayProps): JSX.Element {
  const bids = props.machineContext.bids;
  if (!bids) {
    throw new Error('Bids is not an object!!!');
  }

  return (
    <GameLayout
      seatedAt={props.seatedAt}
      renderPlayerElement={(position) => (
        <FlexView column>
          <div>{props.gameConfig.playerFriendlyNames[position]}</div>
          <div>{bids[position]}</div>
        </FlexView>
      )}
      tableCenterElement={
        <FlexView column>
          <button
            onClick={() =>
              props.sendGameEvent({
                type: 'PLAYER_BID',
                bid: 2,
                position: 'north',
              })
            }
          >
            Send Bid Event 2 North
          </button>
          <button
            onClick={() =>
              props.sendGameEvent({
                type: 'PLAYER_BID',
                bid: 3,
                position: 'east',
              })
            }
          >
            Send Bid Event 3 East
          </button>
          <button
            onClick={() =>
              props.sendGameEvent({
                type: 'PLAYER_BID',
                bid: 4,
                position: 'south',
              })
            }
          >
            Send Bid Event 4 South
          </button>
          <button
            onClick={() =>
              props.sendGameEvent({
                type: 'PLAYER_BID',
                bid: 5,
                position: 'west',
              })
            }
          >
            Send Bid Event 5 West
          </button>
        </FlexView>
      }
    />
  );
}
