import { useEffect, useState } from 'react';
import { PublicGameConfig } from '../../../functions/apiContract/database/DataModel';
import * as DAO from '../firebase/ReadDAO';
import { JoinGame } from './JoinGame';
import { GameNotFound } from './GameNotFound';

export type GameContainerProps = {
  gameId: string;
};

export function GameContainer(props: GameContainerProps) {
  const [gameConfig, setGameConfig] = useState<
    PublicGameConfig | undefined | 'gameNotFound'
  >(undefined);

  useEffect(() => {
    return DAO.subscribeToPublicGameConfig(props.gameId, (gameConfig) =>
      setGameConfig(gameConfig ?? 'gameNotFound')
    );
  }, [props.gameId]);

  if (gameConfig === undefined) {
    // Still loading the initial value
    return <></>;
  }

  if (gameConfig === 'gameNotFound') {
    return <GameNotFound />;
  }

  return <JoinGame gameId={props.gameId} {...gameConfig} />;
}
