import Button from '@material-ui/core/Button';
import FlexView from 'react-flexview/lib';
import { useNavigate } from '@reach/router';
import { makeNewGameAndNavigateThere } from '../uiHelpers/makeNewGameAndNavigateThere';

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
  return (
    <div>
      <Button
        variant="contained"
        onClick={() => makeNewGameAndNavigateThere(navigate)}
      >
        New Game
      </Button>
    </div>
  );
}
