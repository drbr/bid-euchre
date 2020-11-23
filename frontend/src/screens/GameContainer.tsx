import { useNavigate } from '@reach/router';
import { useEffect, useState } from 'react';
import { getPublicGameConfig } from '../firebase/DatabaseClient';
import { GameNotFound } from './GameNotFound';

export type GameContainerProps = {
  gameId: string;
};

export function GameContainer(props: GameContainerProps) {
  const [gameValue, setGameValue] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGameValue() {
      const game = await getPublicGameConfig(props.gameId);
      setGameValue(
        game ? String(JSON.stringify(game.playerFriendlyNames)) : ''
      );
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
