import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { Suit } from '../../../functions/apiContract/database/Cards';
import { NameTrumpEvent } from '../gameLogic/euchreStateMachine/RoundStateTypes';
import { PlayerBidCard } from './BiddingDisplay';
import { DebugButton } from './DebugButton';
import { GameLayout } from './GameLayout';
import { RoundDisplayProps } from './RoundDisplay';

export function NameTrumpDisplay(props: RoundDisplayProps): JSX.Element {
  const { highestBid, highestBidder } = props.stateContext;

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
      seatedAt={props.seatedAt}
      awaitedPosition={highestBidder}
      renderPlayerElement={(position) => (
        <PlayerBidCard
          playerName={props.gameConfig.playerFriendlyNames[position]}
          bid={position === highestBidder ? highestBid : null}
        />
      )}
      promptMessage={promptMessage}
      hands={props.stateContext.private_hands}
      userActionElement={<SuitButtons {...props} />}
      debugControls={<NameTrumpDebugControls {...props} />}
    />
  );
}

function SuitButtons(props: RoundDisplayProps) {
  return (
    <Grid container spacing={1} justify="center">
      <SuitButton {...props} suit="C" />
      <SuitButton {...props} suit="S" />
      <SuitButton {...props} suit="D" />
      <SuitButton {...props} suit="H" />
    </Grid>
  );
}

function SuitButton(props: RoundDisplayProps & { suit: Suit }) {
  if (!props.seatedAt) {
    return null;
  }

  const event: NameTrumpEvent = {
    type: 'NAME_TRUMP',
    position: props.seatedAt,
    trumpSuit: props.suit,
  };

  const enabled = props.isEventValid(event);
  const sendEvent = () => props.sendGameEvent(event);

  const suitInfo = SuitDisplay[props.suit];
  return (
    <Grid item xs={3} sm={2}>
      <Button
        style={{ color: suitInfo.color, fontSize: 40 }}
        disabled={!enabled}
        onClick={sendEvent}
        variant="contained"
      >
        <div style={{ marginTop: -15, marginBottom: -10 }}>{suitInfo.text}</div>
      </Button>
    </Grid>
  );
}

const SuitDisplay: Record<Suit, { text: string; color: string }> = {
  H: { text: '♥️', color: 'red' },
  D: { text: '♦️️', color: 'red' },
  S: { text: '♠', color: 'black' },
  C: { text: '♣️️', color: 'black' },
};

function NameTrumpDebugControls(props: RoundDisplayProps) {
  function renderButton(event: NameTrumpEvent) {
    return (
      <DebugButton
        {...props}
        event={event}
        text={(event) =>
          `${event.position} names ${SuitDisplay[event.trumpSuit].text}`
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
