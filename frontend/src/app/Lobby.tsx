import { useNavigate } from '@reach/router';
import { useState } from 'react';
import FlexView from 'react-flexview/lib';
import { makeNewGameAndNavigateThere } from '../routines/makeNewGameAndNavigateThere';
import { ActionButton } from '../euchreGameDisplay/components/ActionButton';

export function Lobby() {
  return (
    <FlexView column vAlignContent="center">
      <h1>Play Bid Euchre!</h1>
      <p>
        <a href="https://www.euchre.space">Read the rules</a>
      </p>
      <NewGameSection />
    </FlexView>
  );
}

export function NewGameSection() {
  const navigate = useNavigate();

  const [creatingGameInProgress, setCreatingGameInProgress] = useState(false);

  function onButtonClick() {
    setCreatingGameInProgress(true);
    makeNewGameAndNavigateThere(navigate).catch(() =>
      setCreatingGameInProgress(false)
    );
  }

  return (
    <div>
      <ActionButton
        variant="contained"
        disabled={false}
        onClick={onButtonClick}
        actionInProgress={creatingGameInProgress}
      >
        New Game
      </ActionButton>
    </div>
  );
}
