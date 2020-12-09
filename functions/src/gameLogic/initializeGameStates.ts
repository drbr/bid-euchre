import * as _ from 'lodash';
import { extractPrivateGameState } from '../../../frontend/src/gameLogic/stateMachineUtils/extractPrivateState';
import { getInitialMachineState } from '../../../frontend/src/gameLogic/stateMachineUtils/getInitialMachineState';
import {
  sanitizeState,
  serializeState,
} from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';
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
  const initialMachineState = getInitialMachineState();
  const sanitizedState = sanitizeState(initialMachineState);

  const { publicContext, privateContextsByPlayerId } = extractPrivateGameState(
    initialMachineState.context,
    props.playerIdentities
  );

  const publicState = { ...sanitizedState, context: publicContext };
  const publicStateJson = serializeState(publicState);

  const privateContextsJsonByPlayerId = _.mapValues(
    privateContextsByPlayerId,
    (context) => JSON.stringify(context)
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
