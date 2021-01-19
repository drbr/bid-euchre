import Box from '@material-ui/core/Box';
import { StartDealEvent } from '../gameLogic/euchreStateMachine/RoundStateTypes';
import {
  ActionButton,
  actionButtonPropsForGameEvent,
} from '../uiHelpers/ActionButton';
import { DebugButton } from './DebugButton';
import { GameLayout } from './GameLayout';
import { RoundDisplayProps } from './RoundDisplay';

export function DealDisplay(props: RoundDisplayProps): JSX.Element {
  const { currentDealer, roundIndex } = props.stateContext;

  const dealerName = props.gameConfig.playerFriendlyNames[currentDealer];
  const dealerPrompt =
    roundIndex === 0 ? 'You are the first dealer' : 'You are the next dealer';

  const promptMessage =
    props.seatedAt === currentDealer
      ? `${dealerPrompt}. Click the DEAL button to start the round.`
      : `Waiting for ${dealerName} to deal the next round…`;

  return (
    <GameLayout
      playerFriendlyNames={props.gameConfig.playerFriendlyNames}
      seatedAt={props.seatedAt}
      awaitedPosition={currentDealer}
      renderPlayerCardContent={() => null}
      promptMessage={promptMessage}
      hands={props.stateContext.private_hands}
      userActionControls={<DealButton {...props} />}
      debugControls={<DealDebugControls {...props} />}
    />
  );
}

function DealButton(props: RoundDisplayProps) {
  if (props.seatedAt !== props.stateContext.currentDealer) {
    return null;
  }

  const event: StartDealEvent = {
    type: 'DEALER_STARTS_DEAL',
    position: props.seatedAt,
  };

  return (
    <ActionButton
      {...actionButtonPropsForGameEvent(event, props)}
      variant="contained"
    >
      DEAL
    </ActionButton>
  );
}

function DealDebugControls(props: RoundDisplayProps) {
  return (
    <Box display="flex" flexDirection="column" p={3}>
      <DebugButton
        {...props}
        event={{
          type: 'DEALER_STARTS_DEAL',
          position: props.stateContext.currentDealer,
        }}
        text={(event) => `${props.stateContext.currentDealer} deals`}
      />
    </Box>
  );
}
