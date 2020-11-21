import { useState } from 'react';
import { newGame } from '../firebase/ApiClient';

export function NewGameUI() {
  const [gameId, setGameId] = useState('');

  const callForNewGame = () => {
    newGame({}).then(({ gameId }) => setGameId(gameId));
  };

  return (
    <div>
      <p>Game ID: {gameId}</p>
      <button onClick={callForNewGame}>New Game</button>
    </div>
  );
}
