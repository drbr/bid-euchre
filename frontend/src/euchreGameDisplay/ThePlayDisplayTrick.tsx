import * as React from 'react';
import { Card } from '../gameLogic/Cards';
import { GameLayout } from './components/GameLayout';
import { HandDisplay } from './components/HandDisplay';
import { ThePlayDisplayProps } from './ThePlayDisplayDelegator';

export function ThePlayDisplayTrick(props: ThePlayDisplayProps): JSX.Element {
  const awaitedPosition = props.stateContext.awaitedPlayer;
  const awaitedPlayerName =
    props.gameConfig.playerFriendlyNames[awaitedPosition];
  const promptMessage =
    props.stateContext.awaitedPlayer === props.seatedAt
      ? "It's your turn. Click a card to play it."
      : `Waiting for ${awaitedPlayerName} to play a card…`;

  return (
    <GameLayout
      playerFriendlyNames={props.gameConfig.playerFriendlyNames}
      score={props.stateContext.score}
      trumpSuit={props.stateContext.trump}
      seatedAt={props.seatedAt}
      awaitedPosition={awaitedPosition}
      renderPlayerCardContent={(position) => (
        <ThePlayCardContent card={props.stateContext.currentTrick[position]} />
      )}
      promptMessage={promptMessage}
      handsElement={
        <HandDisplay
          position={props.seatedAt}
          renderAsButtons={true}
          {...props}
        />
      }
      debugControls={<TrickDebugControls {...props} />}
    />
  );
}

export function ThePlayCardContent(props: {
  card: Card | null;
}): JSX.Element | null {
  if (props.card) {
    return <span>{JSON.stringify(props.card)}</span>;
  } else {
    return null;
  }
}

function TrickDebugControls(props: ThePlayDisplayProps): JSX.Element {
  const awaitedPlayer = props.stateContext.awaitedPlayer;

  return (
    <HandDisplay position={awaitedPlayer} renderAsButtons={true} {...props} />
  );
}
