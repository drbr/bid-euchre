import { useState } from 'react';
import { newGame } from '../firebase/ApiClient';
import { getGameValue } from '../firebase/DatabaseClient';

export function NewGameUI() {
  const [gameId, setGameId] = useState('');
  const [gameValue, setGameValue] = useState('');

  function callForNewGame() {
    return newGame().then(({ gameId }) => setGameId(gameId));
  }

  function callForGameValue() {
    return getGameValue(gameId).then(({ randomValue }) =>
      setGameValue(String(randomValue))
    );
  }

  return (
    <div>
      <p>Game ID: {gameId}</p>
      <p>Game Value: {gameValue}</p>
      <div>
        <button onClick={callForNewGame}>New Game</button>
      </div>
      <div>
        <button onClick={callForGameValue} disabled={!gameId}>
          Get Game Info
        </button>
      </div>
    </div>
  );
}
