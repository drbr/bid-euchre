import Button from '@material-ui/core/Button';
import { useNavigate } from '@reach/router';
import { makeNewGameAndNavigateThere } from '../uiHelpers/makeNewGameAndNavigateThere';

export function Lobby() {
  return (
    <div>
      <h1>Play Bid Euchre!</h1>
      <p>
        <a href="https://www.euchre.space">Read the rules</a>
      </p>
      <NewGameSection />
    </div>
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
