import { useNavigate } from '@reach/router';
import { makeNewGameAndNavigateThere } from '../uiActions/makeNewGameAndNavigateThere';

export function Lobby() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Play Bid Euchre!</h1>
      <p>
        <a href="https://www.euchre.space">Read the rules</a>
      </p>
      <div>
        <button onClick={() => makeNewGameAndNavigateThere(navigate)}>
          New Game
        </button>
      </div>
    </div>
  );
}
