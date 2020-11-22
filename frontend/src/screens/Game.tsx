import { useEffect, useState } from 'react';
import { getGameValue } from '../firebase/DatabaseClient';

export type GameProps = {
  gameId: string;
};

export function Game(props: GameProps) {
  const [gameValue, setGameValue] = useState('');

  useEffect(() => {
    async function callForGameValue() {
      const { randomValue } = await getGameValue(props.gameId);
      setGameValue(String(randomValue));
    }
    void callForGameValue();
  }, [props.gameId]);

  if (!gameValue) {
    return <></>;
  }

  return (
    <div>
      <p>Game ID: {props.gameId}</p>
      <p>Game Value: {gameValue}</p>
    </div>
  );
}
