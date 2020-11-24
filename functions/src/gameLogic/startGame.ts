import * as _ from 'lodash';
import {
  PlayerIdentities,
  PlayerPrivateGameStates,
  PublicGameConfig,
  PublicGameState,
} from '../../apiContract/database/DataModel';
import { Position } from '../../apiContract/database/GameState';
import * as DAO from '../databaseHelpers/BackendDAO';

export async function startGame(props: {
  gameId: string;
  playerIdentities: PlayerIdentities;
  gameConfig: PublicGameConfig;
}): Promise<void> {
  const privateGameStates: PlayerPrivateGameStates = {};

  for (const pos in props.playerIdentities) {
    const position = pos as Position;
    const playerId = props.playerIdentities[position]!;
    privateGameStates[playerId] = {
      hand: [],
    };
  }

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
