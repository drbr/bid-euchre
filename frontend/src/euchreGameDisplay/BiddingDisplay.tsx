import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import FlexView from 'react-flexview/lib';
import {
  getHighestBid,
  UltimateBidChart,
} from '../gameLogic/euchreStateMachine/BiddingStateMachine';
import {
  BiddingContext,
  BiddingEvent,
  PlayerBidEvent,
} from '../gameLogic/euchreStateMachine/BiddingStateTypes';
import { GameContext } from '../gameLogic/euchreStateMachine/GameStateTypes';
import { RoundContext } from '../gameLogic/euchreStateMachine/RoundStateTypes';
import { Bid } from '../gameLogic/EuchreTypes';
import { ActionButton } from '../uiHelpers/ActionButton';
import { DebugButton } from './DebugButton';
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
      <ActionButton
        variant="contained"
        onClick={sendEvent}
        disabled={!enabled}
        actionInProgress={props.sendGameEventInProgress}
      >
        {buttonText}
      </ActionButton>
    </Box>
  );
}

export function PlayerBidCard(props: { playerName: string; bid: Bid | null }) {
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
  function renderButton(event: PlayerBidEvent) {
    return (
      <DebugButton
        {...props}
        event={event}
        text={(event) => `Send bid event ${event.bid} ${event.position}`}
      />
    );
  }

  return (
    <Box display="flex" flexDirection="column" p={3}>
      {renderButton({
        type: 'PLAYER_BID',
        bid: 'pass',
        position: 'north',
      })}
      {renderButton({
        type: 'PLAYER_BID',
        bid: 2,
        position: 'east',
      })}
      {renderButton({
        type: 'PLAYER_BID',
        bid: 3,
        position: 'south',
      })}
      {renderButton({
        type: 'PLAYER_BID',
        bid: 'pass',
        position: 'west',
      })}
    </Box>
  );
}
