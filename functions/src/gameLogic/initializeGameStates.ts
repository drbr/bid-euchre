import { getInitialMachineState } from '../../../frontend/src/gameLogic/stateMachineUtils/getInitialMachineState';
import { PlayerIdentities } from '../../apiContract/database/DataModel';
import * as DAO from '../databaseHelpers/BackendDAO';
import { preparePublicAndPrivateStateForStorage } from './preparePublicAndPrivateStateForStorage';

export async function initializeGameStates(props: {
  gameId: string;
  playerIdentities: PlayerIdentities;
}): Promise<void> {
  const {
    publicStateJson,
    privateContextsJsonByPlayerId,
  } = preparePublicAndPrivateStateForStorage(
    getInitialMachineState(),
    props.playerIdentities
  );

  await Promise.all([
    DAO.transactionallySetFullGameMachineStateJson({
      gameId: props.gameId,
      transactionUpdate: getInitialMachineState,
    }),
    DAO.setPublicGameMachineStateJson({
      gameId: props.gameId,
      machineStateJson: publicStateJson,
    }),
    DAO.setPlayerPrivateGameStates({
      gameId: props.gameId,
      gameStates: privateContextsJsonByPlayerId,
    }),
  ]);

  await DAO.setGameStatus({
    gameId: props.gameId,
    gameStatus: 'inProgress',
  });
}
