import { getInitialMachineState } from '../../../frontend/src/gameLogic/stateMachineUtils/getInitialMachineState';
import { serializeAndSanitizeState } from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';
import { forEachPosition } from '../../../frontend/src/gameLogic/utils/ModelHelpers';
import {
  PlayerIdentities,
  PlayerPrivateGameStatesJson,
} from '../../apiContract/database/DataModel';
import * as DAO from '../databaseHelpers/BackendDAO';

export async function initializeGameStates(props: {
  gameId: string;
  playerIdentities: PlayerIdentities;
}): Promise<void> {
  const privateGameStates: PlayerPrivateGameStatesJson = {};
  forEachPosition(props.playerIdentities, (playerId) => {
    // TODO: Replace this with the actual censored initial state
    privateGameStates[playerId!] = JSON.stringify({});
  });

  const initialMachineState = getInitialMachineState();
  const initialPublicStateJson = serializeAndSanitizeState(initialMachineState);

  await Promise.all([
    DAO.setPlayerPrivateGameStates({
      gameId: props.gameId,
      gameStates: privateGameStates,
    }),
    DAO.setPublicGameMachineStateJson({
      gameId: props.gameId,
      machineStateJson: initialPublicStateJson,
    }),
    DAO.transactionallySetFullGameMachineStateJson({
      gameId: props.gameId,
      transactionUpdate: getInitialMachineState,
    }),
    DAO.setGameStatus({
      gameId: props.gameId,
      gameStatus: 'inProgress',
    }),
  ]);
}
