import { ThePlayDisplayProps } from './ThePlayDisplayDelegator';
import { GameLayout } from './components/GameLayout';
import { HandDisplay } from './components/HandDisplay';
import { InfoStateOKButton } from './components/InfoStateOKButton';
import { getTrickWinner } from '../gameLogic/euchreStateMachine/ThePlayStateMachine';

export function TrickCompleteInfo(props: ThePlayDisplayProps): JSX.Element {
  const winningPosition = getTrickWinner(props.stateContext);
  const winningPlayerName =
    props.gameConfig.playerFriendlyNames[winningPosition];

  const prompt =
    winningPosition === props.seatedAt
      ? 'You won the trick!'
      : `${winningPlayerName} won the trick.`;

  return (
    <GameLayout
      playerFriendlyNames={props.gameConfig.playerFriendlyNames}
      score={props.stateContext.score}
      trumpSuit={props.stateContext.trump}
      seatedAt={props.seatedAt}
      renderPlayerCardContent={(position) => 'Hello'}
      promptMessage={prompt}
      handsElement={<HandDisplay renderAsButtons={false} {...props} />}
      userActionControls={<InfoStateOKButton {...props} />}
    />
  );
}
