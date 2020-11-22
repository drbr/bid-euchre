import { useNavigate } from '@reach/router';
import { makeNewGameAndNavigateThere } from '../uiActions/makeNewGameAndNavigateThere';

export function Lobby() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Play Bid Euchre!</h1>
      <div>
        <button onClick={() => makeNewGameAndNavigateThere(navigate)}>
          New Game
        </button>
      </div>
    </div>
  );
}
