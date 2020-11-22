import { useNavigate } from '@reach/router';
import { makeNewGameAndNavigateThere } from '../uiActions/makeNewGameAndNavigateThere';

export function GameNotFound() {
  const navigate = useNavigate();

  return (
    <div>
      <p>A game with that ID was not found.</p>
      <div>
        <button onClick={() => makeNewGameAndNavigateThere(navigate)}>
          Start a new game
        </button>
      </div>
    </div>
  );
}
