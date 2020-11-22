import { useNavigate } from '@reach/router';
import { useEffect, useState } from 'react';
import { getGameValue } from '../firebase/DatabaseClient';
import { GameNotFound } from './GameNotFound';

export type GameProps = {
  gameId: string;
};

export function Game(props: GameProps) {
  const [gameValue, setGameValue] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGameValue() {
      const game = await getGameValue(props.gameId);
      setGameValue(game ? String(game.randomValue) : '');
    }
    void fetchGameValue();
  }, [props.gameId, navigate]);

  if (gameValue === undefined) {
    return <></>;
  }

  if (gameValue === '') {
    return <GameNotFound />;
  }

  return (
    <div>
      <p>Game ID: {props.gameId}</p>
      <p>Game Value: {gameValue}</p>
    </div>
  );
}
