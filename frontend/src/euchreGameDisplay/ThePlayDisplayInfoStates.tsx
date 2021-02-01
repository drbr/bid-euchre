import { getTrickWinner } from '../gameLogic/euchreStateMachine/ThePlayStateMachine';
import { GameLayout } from './components/GameLayout';
import { HandDisplay } from './components/HandDisplay';
import { InfoStateOKButton } from './components/InfoStateOKButton';
import { ThePlayDisplayProps } from './ThePlayDisplayDelegator';
import { PlayedCard } from './ThePlayDisplayTrick';

export function TrickCompleteInfo(props: ThePlayDisplayProps): JSX.Element {
  const winningPosition = getTrickWinner(props.stateContext);
  const winningPlayerName =
    props.gameConfig.playerFriendlyNames[winningPosition];

  const prompt =
    winningPosition === props.seatedAt
      ? 'You won the trick!'
      : `${winningPlayerName} won the trick!`;

  return (
    <GameLayout
      playerFriendlyNames={props.gameConfig.playerFriendlyNames}
      score={props.stateContext.score}
      trumpSuit={props.stateContext.trump}
      seatedAt={props.seatedAt}
      awaitedPosition={props.stateContext.awaitedPlayer}
      renderPlayerCardContent={(position) => (
        <PlayedCard card={props.stateContext.currentTrick[position]} />
      )}
      promptMessage={prompt}
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
