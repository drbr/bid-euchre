import { getInitialMachineState } from '../../../frontend/src/gameLogic/stateMachineUtils/getInitialMachineState';
import { serializeState } from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';
import { PlayerIdentities } from '../../apiContract/database/DataModel';
import * as DAO from '../databaseHelpers/BackendDAO';
import { preparePublicAndPrivateStateForStorage } from './preparePublicAndPrivateStateForStorage';

export async function initializeGameStates(props: {
  gameId: string;
  playerIdentities: PlayerIdentities;
}): Promise<void> {
  const initialMachineState = getInitialMachineState();

  const {
    publicStateJson,
    privateContextsJsonByPlayerId,
  } = preparePublicAndPrivateStateForStorage(
    initialMachineState,
    props.playerIdentities
  );

  await DAO.transactionallySetGameStates({
    gameId: props.gameId,
    transactionUpdate: () => ({
      fullJson: serializeState(initialMachineState),
      publicJson: publicStateJson,
      privateContextsJson: privateContextsJsonByPlayerId,
    }),
  });

  await DAO.setGameStatus({
    gameId: props.gameId,
    gameStatus: 'inProgress',
  });
}
