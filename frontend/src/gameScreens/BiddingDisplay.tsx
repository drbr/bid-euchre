import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import FlexView from 'react-flexview/lib';
import { Bid } from '../../../functions/apiContract/database/GameState';
import {
  BiddingContext,
  BiddingEvent,
  BiddingState
} from '../gameLogic/stateMachine/BiddingStateTypes';
import {
  ScopedGameDisplayProps,
  UnscopedGameDisplayProps
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
      awaitedPosition={props.machineContext.awaitedPlayer}
      renderPlayerElement={(position) => (
        <PlayerBid
          playerName={props.gameConfig.playerFriendlyNames[position]}
          bid={bids[position]}
        />
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

function PlayerBid(props: { playerName: string; bid: Bid }) {
  const translatedBid =
    props.bid === 'pass' ? 'Pass' : props.bid === null ? '\u00a0' : props.bid;

  return (
    <>
      <Typography variant="h6" align="center">
        {props.playerName}
      </Typography>
      <Typography variant="h4" align="center">
        {translatedBid}
      </Typography>
    </>
  );
}
