import { forEachPosition } from '../../../frontend/src/gameLogic/ModelHelpers';
import {
  PlayerIdentities,
  PlayerPrivateGameStates,
  PublicGameConfig,
} from '../../apiContract/database/DataModel';
import * as DAO from '../databaseHelpers/BackendDAO';
import { getInitialMachineState } from './BackendStateMachine';

export async function initializeGameStates(props: {
  gameId: string;
  playerIdentities: PlayerIdentities;
  gameConfig: PublicGameConfig;
}): Promise<void> {
  const privateGameStates: PlayerPrivateGameStates = {};

  forEachPosition(props.playerIdentities, (playerId) => {
    privateGameStates[playerId!] = {};
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
  ]);
}
