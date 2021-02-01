import Box from '@material-ui/core/Box';
import { StartDealEvent } from '../gameLogic/euchreStateMachine/RoundStateTypes';
import { actionButtonPropsForGameEvent } from './components/ActionButtonProps';
import { ActionButton } from './components/ActionButton';
import { DebugButton } from './components/DebugButton';
import { GameLayout } from './components/GameLayout';
import { HandDisplay } from './components/HandDisplay';
import { RoundDisplayProps } from './RoundDisplayDelegator';

export function RoundDisplayDeal(props: RoundDisplayProps): JSX.Element {
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
      colorMode="light"
      playerFriendlyNames={props.gameConfig.playerFriendlyNames}
      score={props.stateContext.score}
      trumpSuit={undefined}
      seatedAt={props.seatedAt}
      awaitedPosition={currentDealer}
      renderPlayerCardContent={() => null}
      promptMessage={promptMessage}
      handsElement={
        <HandDisplay
          position={props.seatedAt}
          renderAsButtons={false}
          {...props}
        />
      }
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
