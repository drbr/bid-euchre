import Box from '@material-ui/core/Box';
import * as React from 'react';
import FlexView from 'react-flexview/lib';
import {
  getHighestBidSoFar,
  UltimateBidChart,
} from '../gameLogic/euchreStateMachine/BiddingStateMachine';
import {
  BiddingEvent,
  PlayerBidEvent,
} from '../gameLogic/euchreStateMachine/BiddingStateTypes';
import { Bid } from '../gameLogic/EuchreTypes';
import { actionButtonPropsForGameEvent } from './components/ActionButtonProps';
import { ActionButton } from './components/ActionButton';
import { BiddingDisplayProps } from './BiddingDisplayDelegator';
import { displayedBid } from './components/displayedBid';
import { DebugButton } from './components/DebugButton';
import { GameLayout } from './components/GameLayout';
import { HandDisplay } from './components/HandDisplay';

export function BiddingDisplayPlayerBid(
  props: BiddingDisplayProps
): JSX.Element {
  const bids = props.stateContext.bids;

  const awaitedPosition = props.stateContext.awaitedPlayer;
  const awaitedPlayerName =
    props.gameConfig.playerFriendlyNames[awaitedPosition];
  const promptMessage =
    props.stateContext.awaitedPlayer === props.seatedAt
      ? "It's your turn to bid. Select a bid from the options below."
      : `Waiting for ${awaitedPlayerName} to bid…`;

  return (
    <GameLayout
      colorMode="light"
      playerFriendlyNames={props.gameConfig.playerFriendlyNames}
      playersSittingOut={[]}
      score={props.stateContext.score}
      trumpSuit={props.stateContext.trump}
      trickCount={undefined}
      seatedAt={props.seatedAt}
      awaitedPosition={awaitedPosition}
      renderPlayerCardContent={(position) => displayedBid(bids[position])}
      promptMessage={promptMessage}
      handsElement={
        <HandDisplay
          position={props.seatedAt}
          renderAsButtons={false}
          {...props}
        />
      }
      userActionControls={<BidButtons {...props} />}
      debugControls={<PlayerBidDebugControls {...props} />}
    />
  );
}

function BidButtons(props: BiddingDisplayProps) {
  const { highestBid } = getHighestBidSoFar(props.stateContext);
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

  const buttonText = props.text || props.bidValue;
  return (
    <Box p={1}>
      <ActionButton
        {...actionButtonPropsForGameEvent(event, props)}
        variant="contained"
      >
        {buttonText}
      </ActionButton>
    </Box>
  );
}

function PlayerBidDebugControls(props: BiddingDisplayProps) {
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
        bid: 'pass',
        // bid: 2,
        position: 'east',
      })}
      {renderButton({
        type: 'PLAYER_BID',
        // bid: 'pass',
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
