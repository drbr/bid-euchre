import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import { Suit } from '../gameLogic/Cards';
import { getHighestBidSoFar } from '../gameLogic/euchreStateMachine/BiddingStateMachine';
import { NameTrumpEvent } from '../gameLogic/euchreStateMachine/BiddingStateTypes';
import {
  ActionButton,
  actionButtonPropsForGameEvent,
} from './components/ActionButton';
import { BiddingDisplayProps } from './BiddingDisplayDelegator';
import { BidCardContent } from './components/BidCardContent';
import { DebugButton } from './components/DebugButton';
import { GameLayout } from './components/GameLayout';
import { SuitDisplayInfo } from './components/SuitDisplayInfo';

export function BiddingDisplayNameTrump(
  props: BiddingDisplayProps
): JSX.Element {
  const bids = props.stateContext.bids;
  const { highestBid, highestBidder } = getHighestBidSoFar(props.stateContext);

  if (highestBid === undefined || highestBidder === undefined) {
    return <div>ERROR: Highest bidder has not been recorded</div>;
  }

  const highestBidderName = props.gameConfig.playerFriendlyNames[highestBidder];
  const promptMessage =
    props.seatedAt === highestBidder
      ? 'You won the bid! Select a suit to name as trump.'
      : `Waiting for ${highestBidderName} to name the trump suit…`;

  return (
    <GameLayout
      playerFriendlyNames={props.gameConfig.playerFriendlyNames}
      score={props.stateContext.score}
      seatedAt={props.seatedAt}
      awaitedPosition={highestBidder}
      renderPlayerCardContent={(position) => (
        <BidCardContent bid={bids[position]} />
      )}
      promptMessage={promptMessage}
      hands={props.stateContext.private_hands}
      userActionControls={<SuitButtons {...props} />}
      debugControls={<NameTrumpDebugControls {...props} />}
    />
  );
}

function SuitButtons(props: BiddingDisplayProps) {
  return (
    <Grid container spacing={1} justify="center">
      <SuitButton {...props} suit="C" />
      <SuitButton {...props} suit="S" />
      <SuitButton {...props} suit="D" />
      <SuitButton {...props} suit="H" />
    </Grid>
  );
}

function SuitButton(props: BiddingDisplayProps & { suit: Suit }) {
  if (!props.seatedAt) {
    return null;
  }

  const event: NameTrumpEvent = {
    type: 'NAME_TRUMP',
    position: props.seatedAt,
    trumpSuit: props.suit,
  };

  const suitInfo = SuitDisplayInfo[props.suit];
  return (
    <Grid item xs={3} sm={2}>
      <ActionButton
        {...actionButtonPropsForGameEvent(event, props)}
        style={{ color: suitInfo.color, fontSize: 40 }}
        variant="contained"
      >
        <div style={{ marginTop: -15, marginBottom: -10 }}>{suitInfo.text}</div>
      </ActionButton>
    </Grid>
  );
}

function NameTrumpDebugControls(props: BiddingDisplayProps) {
  function renderButton(event: NameTrumpEvent) {
    return (
      <DebugButton
        {...props}
        event={event}
        text={(event) =>
          `${event.position} names ${SuitDisplayInfo[event.trumpSuit].text}`
        }
      />
    );
  }

  return (
    <Box display="flex" flexDirection="column" p={3}>
      {renderButton({
        type: 'NAME_TRUMP',
        trumpSuit: 'C',
        position: 'east',
      })}
      {renderButton({
        type: 'NAME_TRUMP',
        trumpSuit: 'H',
        position: 'south',
      })}
    </Box>
  );
}
