import * as React from 'react';
import { getHighestBidOrThrow } from '../gameLogic/euchreStateMachine/BiddingStateMachine';
import { PartnerOf } from '../gameLogic/utils/PositionHelpers';
import { BiddingDisplayProps } from './BiddingDisplayDelegator';
import { GameLayout } from './components/GameLayout';
import { HandDisplay } from './components/HandDisplay';

export function BiddingDisplayPassCardToPartner(
  props: BiddingDisplayProps
): JSX.Element {
  const maker = getHighestBidOrThrow(props.stateContext).highestBidder;
  if (!maker) {
    throw new Error(
      'Highest bidder is not recorded; they cannot exchange cards'
    );
  }
  const partner = PartnerOf[maker];
  const playerNames = props.gameConfig.playerFriendlyNames;
  const awaitedPosition = props.stateContext.awaitedPlayer;

  const promptMessage =
    props.seatedAt === maker
      ? promptForMaker({
          partnerName: playerNames[partner],
          waitingOnMeNow: props.seatedAt === awaitedPosition,
        })
      : props.seatedAt === partner
      ? promptForPartner({
          makerName: playerNames[maker],
          waitingOnMeNow: props.seatedAt === awaitedPosition,
        })
      : promptForOthers({
          makerName: playerNames[maker],
          partnerName: playerNames[partner],
        });

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
      renderPlayerCardContent={() => null}
      promptMessage={promptMessage}
      handsElement={
        <HandDisplay
          position={props.seatedAt}
          renderAsButtons={true}
          {...props}
        />
      }
      debugControls={<PassCardDebugControls {...props} />}
    />
  );
}

function PassCardDebugControls(props: BiddingDisplayProps): JSX.Element {
  const awaitedPlayer = props.stateContext.awaitedPlayer;

  return (
    <HandDisplay position={awaitedPlayer} renderAsButtons={true} {...props} />
  );
}

function promptForMaker(params: {
  waitingOnMeNow: boolean;
  partnerName: string;
}): string {
  if (params.waitingOnMeNow) {
    return "Select a card to exchange with a card from your partner's hand.";
  } else {
    return `Waiting for ${params.partnerName} to exchange a card…`;
  }
}

function promptForPartner(params: {
  makerName: string;
  waitingOnMeNow: boolean;
}): string {
  if (params.waitingOnMeNow) {
    return "Select a card to give to your partner's hand.";
  } else {
    return `Waiting for ${params.makerName} to discard a card from their hand…`;
  }
}

function promptForOthers(params: {
  makerName: string;
  partnerName: string;
}): string {
  return `Waiting for ${params.makerName} and ${params.partnerName} to exchange cards…`;
}
