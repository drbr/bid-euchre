import { forEachPosition } from '../../../frontend/src/gameLogic/ModelHelpers';
import {
  PlayerIdentities,
  PlayerPrivateGameStates,
} from '../../apiContract/database/DataModel';
import * as DAO from '../databaseHelpers/BackendDAO';
import { getInitialMachineState } from '../../../frontend/src/gameLogic/StateMachineHelpers';

export async function initializeGameStates(props: {
  gameId: string;
  playerIdentities: PlayerIdentities;
}): Promise<void> {
  const privateGameStates: PlayerPrivateGameStates = {};
  forEachPosition(props.playerIdentities, (playerId) => {
    privateGameStates[playerId!] = {
      hand: 'placeholder',
    };
  });

  await Promise.all([
    DAO.setPlayerPrivateGameStates({
      gameId: props.gameId,
      gameStates: privateGameStates,
    }),
    DAO.transactionallySetGameMachineStateJson({
      gameId: props.gameId,
      transactionUpdate: getInitialMachineState,
    }),
    DAO.setGameStatus({
      gameId: props.gameId,
      gameStatus: 'inProgress',
    }),
  ]);
}
