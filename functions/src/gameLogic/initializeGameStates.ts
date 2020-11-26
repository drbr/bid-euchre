import { forEachPosition } from '../../../frontend/src/gameLogic/ModelHelpers';
import {
  PlayerIdentities,
  PlayerPrivateGameStates,
  PublicGameConfig,
  PublicGameState,
} from '../../apiContract/database/DataModel';
import * as DAO from '../databaseHelpers/BackendDAO';

export async function initializeGameStates(props: {
  gameId: string;
  playerIdentities: PlayerIdentities;
  gameConfig: PublicGameConfig;
}): Promise<void> {
  const privateGameStates: PlayerPrivateGameStates = {};

  forEachPosition(props.playerIdentities, (playerId) => {
    privateGameStates[playerId!] = { hand: [] };
  });

  await Promise.all([
    DAO.setPublicGameState({
      gameId: props.gameId,
      gameState: InitialPublicGameState,
    }),
    DAO.setPlayerPrivateGameStates({
      gameId: props.gameId,
      gameStates: privateGameStates,
    }),
  ]);
}

const InitialPublicGameState: PublicGameState = {
  score: {
    northsouth: 0,
    eastwest: 0,
  },
  currentDealer: 'north',
  bids: {
    north: null,
    south: null,
    east: null,
    west: null,
  },
  wonTricksThisRound: {
    northsouth: 0,
    eastwest: 0,
  },
};
