import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import FlexView from 'react-flexview/lib';
import { Bid } from '../../../functions/apiContract/database/GameState';
import {
  getHighestBid,
  UltimateBidChart,
} from '../gameLogic/euchreStateMachine/BiddingStateMachine';
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
          <PlayerBidCard
            playerName={props.gameConfig.playerFriendlyNames[position]}
            bid={bids[position]}
          />
        )}
        promptMessage={promptMessage}
        hands={props.stateContext.private_hands}
        userActionElement={<BidButtons {...props} />}
        debugControls={<BiddingDebugControls {...props} />}
      />
    </div>
  );
}

function BidButtons(props: BiddingDisplayProps) {
  const { highestBid } = getHighestBid(props.stateContext);
  const ultimateBidValue = UltimateBidChart[highestBid];

  return (
    <FlexView hAlignContent="center" wrap={true}>
      <BidButton {...props} bidValue="pass" text="Pass" />
      <BidButton {...props} bidValue={1} />
      <BidButton {...props} bidValue={2} />
      <BidButton {...props} bidValue={3} />
      <BidButton {...props} bidValue={4} />
      <BidButton {...props} bidValue={5} />
      <BidButton {...props} bidValue={6} />
      <BidButton {...props} bidValue={12} />
      <BidButton {...props} bidValue={ultimateBidValue} />
    </FlexView>
  );
}

function BidButton(
  props: BiddingDisplayProps & { bidValue: Bid; text?: string }
) {
  if (!props.seatedAt) {
    return null;
  }

  const event: BiddingEvent = {
    type: 'PLAYER_BID',
    position: props.seatedAt,
    bid: props.bidValue,
  };

  const enabled = props.isEventValid(event);
  const sendEvent = () => props.sendGameEvent(event);

  const buttonText = props.text || props.bidValue;
  return (
    <Box p={1}>
      <Button disabled={!enabled} onClick={sendEvent} variant="contained">
        {buttonText}
      </Button>
    </Box>
  );
}

function PlayerBidCard(props: { playerName: string; bid: Bid | null }) {
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

function BiddingDebugControls(props: BiddingDisplayProps) {
  return (
    <Box display="flex" flexDirection="column" p={3}>
      <DebugButton
        {...props}
        event={{
          type: 'PLAYER_BID',
          bid: 48,
          position: 'north',
        }}
        text="Send Bid Event 48 North"
      />
      <DebugButton
        {...props}
        event={{
          type: 'PLAYER_BID',
          bid: 12,
          position: 'east',
        }}
        text="Send Bid Event 12 East"
      />
      <DebugButton
        {...props}
        event={{
          type: 'PLAYER_BID',
          bid: 24,
          position: 'south',
        }}
        text="Send Bid Event 24 South"
      />{' '}
      <DebugButton
        {...props}
        event={{
          type: 'PLAYER_BID',
          bid: 24,
          position: 'west',
        }}
        text="Send Bid Event 24 West"
      />
    </Box>
  );
}

function DebugButton(
  props: BiddingDisplayProps & { event: BiddingEvent; text: string }
) {
  const enabled = props.isEventValid(props.event);
  return (
    <button
      disabled={!enabled}
      onClick={() => props.sendGameEvent(props.event)}
    >
      {props.text}
    </button>
  );
}
