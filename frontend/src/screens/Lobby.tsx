import { NavigateFn, useNavigate } from '@reach/router';
import { newGame } from '../firebase/ApiClient';
import { GamePathLink } from '../routing/paths';

export function Lobby() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Play Bid Euchre!</h1>
      <div>
        <button onClick={() => callForNewGame(navigate)}>New Game</button>
      </div>
    </div>
  );
}

async function callForNewGame(navigate: NavigateFn) {
  const { gameId } = await newGame();
  await navigate(GamePathLink({ gameId }));
}
