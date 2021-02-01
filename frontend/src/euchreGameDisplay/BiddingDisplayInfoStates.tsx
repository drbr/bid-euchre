import { BiddingDisplayProps } from './BiddingDisplayDelegator';
import { displayedBid } from './components/displayedBid';
import { GameLayout } from './components/GameLayout';
import { HandDisplay } from './components/HandDisplay';
import { InfoStateOKButton } from './components/InfoStateOKButton';
import { SuitDisplayInfo } from './components/SuitDisplayInfo';

export function AllPlayersPassedInfo(props: BiddingDisplayProps): JSX.Element {
  const bids = props.stateContext.bids;

  return (
    <GameLayout
      colorMode="light"
      playerFriendlyNames={props.gameConfig.playerFriendlyNames}
      score={props.stateContext.score}
      trumpSuit={props.stateContext.trump}
      seatedAt={props.seatedAt}
      renderPlayerCardContent={(position) => displayedBid(bids[position])}
      promptMessage="All players passed. A new hand will be dealt."
      handsElement={
        <HandDisplay
          position={props.seatedAt}
          renderAsButtons={false}
          {...props}
        />
      }
      userActionControls={<InfoStateOKButton {...props} />}
    />
  );
}

export function PlayerNamedTrumpInfo(props: BiddingDisplayProps) {
  const bids = props.stateContext.bids;
  const playerNames = props.gameConfig.playerFriendlyNames;
  const positionWhoNamedTrump = props.stateContext.awaitedPlayer;
  const trumpSuit = props.stateContext.trump;
  if (!trumpSuit) {
    throw Error('A trump has not been named');
  }

  // The player who named the trump doesn't need to be notified that they did so;
  // skip right ahead to the next real state.
  if (props.seatedAt === positionWhoNamedTrump && props.unblockHead) {
    props.unblockHead();
    return null;
  }

  const playerNameWhoNamedTrump = playerNames[positionWhoNamedTrump];
  const trumpSuitName = SuitDisplayInfo[trumpSuit].longName;
  const promptMessage = `${playerNameWhoNamedTrump} named ${trumpSuitName} as trump.`;

  return (
    <GameLayout
      colorMode="light"
      playerFriendlyNames={props.gameConfig.playerFriendlyNames}
      score={props.stateContext.score}
      trumpSuit={props.stateContext.trump}
      seatedAt={props.seatedAt}
      renderPlayerCardContent={(position) => displayedBid(bids[position])}
      promptMessage={promptMessage}
      handsElement={
        <HandDisplay
          position={props.seatedAt}
          renderAsButtons={false}
          {...props}
        />
      }
      userActionControls={<InfoStateOKButton {...props} />}
    />
  );
}
