import { getHighestBidSoFar } from '../gameLogic/euchreStateMachine/BiddingStateMachine';
import { BiddingDisplayProps } from './BiddingDisplayDelegator';
import { BidCardContent } from './components/BidCardContent';
import { GameLayout } from './components/GameLayout';
import { InfoStateOKButton } from './components/InfoStateOKButton';
import { SuitDisplayInfo } from './components/SuitDisplayInfo';

export function AllPlayersPassedInfo(props: BiddingDisplayProps): JSX.Element {
  const bids = props.stateContext.bids;

  return (
    <GameLayout
      playerFriendlyNames={props.gameConfig.playerFriendlyNames}
      score={props.stateContext.score}
      trumpSuit={props.stateContext.trump}
      seatedAt={props.seatedAt}
      renderPlayerCardContent={(position) => (
        <BidCardContent bid={bids[position]} />
      )}
      promptMessage="All players passed. A new hand will be dealt."
      hands={props.stateContext.private_hands}
      userActionControls={<InfoStateOKButton {...props} />}
    />
  );
}

export function PlayerNamedTrumpInfo(props: BiddingDisplayProps) {
  const bids = props.stateContext.bids;
  const playerNames = props.gameConfig.playerFriendlyNames;

  const positionWhoNamedTrump = getHighestBidSoFar(props.stateContext)
    .highestBidder;
  if (!positionWhoNamedTrump) {
    throw Error('Nobody made a high bid');
  }
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
      playerFriendlyNames={props.gameConfig.playerFriendlyNames}
      score={props.stateContext.score}
      trumpSuit={props.stateContext.trump}
      seatedAt={props.seatedAt}
      renderPlayerCardContent={(position) => (
        <BidCardContent bid={bids[position]} />
      )}
      promptMessage={promptMessage}
      hands={props.stateContext.private_hands}
      userActionControls={<InfoStateOKButton {...props} />}
    />
  );
}
