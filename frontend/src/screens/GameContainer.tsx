import { useEffect, useState } from 'react';
import * as DAO from '../firebase/ReadDAO';
import { GameNotFound } from './GameNotFound';

export type GameContainerProps = {
  gameId: string;
};

export function GameContainer(props: GameContainerProps) {
  const [gameValue, setGameValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    return DAO.subscribeToPublicGameConfig(props.gameId, (gameConfig) => {
      const gameValue = gameConfig ? String(JSON.stringify(gameConfig)) : '';
      setGameValue(gameValue);
    });
  }, [props.gameId]);

  if (gameValue === undefined) {
    // Still loading the initial value
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
