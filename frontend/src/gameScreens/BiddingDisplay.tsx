import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import FlexView from 'react-flexview/lib';
import { Bid } from '../../../functions/apiContract/database/GameState';
import {
  BiddingContext,
  BiddingEvent,
} from '../gameLogic/euchreStateMachine/BiddingStateTypes';
import { GameContext } from '../gameLogic/euchreStateMachine/GameStateTypes';
import { RoundContext } from '../gameLogic/euchreStateMachine/RoundStateTypes';
import {
  ScopedGameDisplayProps,
  UnscopedGameDisplayProps,
} from './GameDisplay';
import { GameLayout, PLACEHOLDER } from './GameLayout';

export type BiddingDisplayProps = ScopedGameDisplayProps<
  BiddingContext & RoundContext & GameContext,
  BiddingEvent
> &
  UnscopedGameDisplayProps;

export function BiddingDisplay(props: BiddingDisplayProps): JSX.Element {
  const bids = props.stateContext.bids;
  if (!bids) {
    throw new Error('Bids is not an object!!!');
  }

  const awaitedPosition = props.stateContext.awaitedPlayer;
  const awaitedPlayerName =
    props.gameConfig.playerFriendlyNames[awaitedPosition];
  const promptMessage =
    props.stateContext.awaitedPlayer === props.seatedAt
      ? "It's your turn to bid. Choose a bid from the options below."
      : `Waiting for ${awaitedPlayerName} to bid…`;

  return (
    <div>
      <GameLayout
        seatedAt={props.seatedAt}
        awaitedPosition={awaitedPosition}
        renderPlayerElement={(position) => (
          <PlayerBidElement
            playerName={props.gameConfig.playerFriendlyNames[position]}
            bid={bids[position]}
          />
        )}
        promptMessage={promptMessage}
        hand={
          props.seatedAt
            ? props.stateContext.private_hands[props.seatedAt]
            : undefined
        }
        userActionElement={
          <FlexView hAlignContent="center" wrap={true}>
            <BidButton value="pass" />
            <BidButton value={1} />
            <BidButton value={2} />
            <BidButton value={3} />
            <BidButton value={4} />
            <BidButton value={5} />
            <BidButton value={6} />
            <BidButton value={12} />
            <BidButton value={24} />
          </FlexView>
        }
      />
      <Box flexDirection="column" p={3}>
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
      </Box>
    </div>
  );
}

function BidButton(props: { value: Bid; text?: string }) {
  const buttonText = props.text || props.value;
  return (
    <Box p={1}>
      <Button variant="contained">{buttonText}</Button>
    </Box>
  );
}

function PlayerBidElement(props: { playerName: string; bid: Bid }) {
  const translatedBid =
    props.bid === 'pass'
      ? 'Pass'
      : props.bid === null
      ? PLACEHOLDER
      : props.bid;

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
