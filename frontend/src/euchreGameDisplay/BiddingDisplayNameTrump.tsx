import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import { Suit } from '../gameLogic/Cards';
import { NameTrumpEvent } from '../gameLogic/euchreStateMachine/BiddingStateTypes';
import {
  actionButtonPropsForGameEvent,
} from './components/ActionButtonProps';
import { ActionButton } from "./components/ActionButton";
import { BiddingDisplayProps } from './BiddingDisplayDelegator';
import { BidCardContent } from './components/BidCardContent';
import { DebugButton } from './components/DebugButton';
import { GameLayout } from './components/GameLayout';
import { HandDisplay } from './components/HandDisplay';
import { SuitDisplayInfo } from './components/SuitDisplayInfo';

export function BiddingDisplayNameTrump(
  props: BiddingDisplayProps
): JSX.Element {
  const bids = props.stateContext.bids;
  const awaitedPlayer = props.stateContext.awaitedPlayer;
  const awaitedPlayerName = props.gameConfig.playerFriendlyNames[awaitedPlayer];
  const promptMessage =
    props.seatedAt === awaitedPlayer
      ? 'You won the bid! Select a suit to name as trump.'
      : `Waiting for ${awaitedPlayerName} to name the trump suit…`;

  return (
    <GameLayout
      playerFriendlyNames={props.gameConfig.playerFriendlyNames}
      score={props.stateContext.score}
      trumpSuit={props.stateContext.trump}
      seatedAt={props.seatedAt}
      awaitedPosition={awaitedPlayer}
      renderPlayerCardContent={(position) => (
        <BidCardContent bid={bids[position]} />
      )}
      promptMessage={promptMessage}
      handsElement={
        <HandDisplay
          position={props.seatedAt}
          renderAsButtons={false}
          {...props}
        />
      }
      userActionControls={
        awaitedPlayer === props.seatedAt ? <SuitButtons {...props} /> : null
      }
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
