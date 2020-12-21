import { serializeState } from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';
import { StartGameEvent } from '../../../frontend/src/gameLogic/stateMachineUtils/SpecialEvents';
import { PlayerIdentities } from '../../apiContract/database/DataModel';
import { getInitialMachineState } from '../backendStateMachineUtils/getInitialMachineState';
import { preparePublicAndPrivateStateForStorage } from '../backendStateMachineUtils/preparePublicAndPrivateStateForStorage';
import { transitionStateMachine } from '../backendStateMachineUtils/transitionStateMachine';
import * as DAO from '../databaseHelpers/BackendDAO';

export async function initializeGameStates(props: {
  gameId: string;
  playerIdentities: PlayerIdentities;
}): Promise<void> {
  // Start the game by sending the initial event to a running state machine service. One would think
  // that we can just use the initial state, but if the initial state transitions involve executing
  // any actions, we need to invoke those actions to increment the game state up to the first state
  // that requires player interaction.
  const startGameEvent: StartGameEvent = { type: 'START_GAME' };
  const nextState = await transitionStateMachine(
    { hydratedState: getInitialMachineState() },
    startGameEvent
  );

  await DAO.transactionallySetGameStates({
    gameId: props.gameId,
    transactionUpdate: () => {
      const {
        publicStateJson,
        privateContextsJsonByPlayerId,
      } = preparePublicAndPrivateStateForStorage(
        nextState,
        props.playerIdentities
      );

      return {
        fullJson: serializeState(nextState),
        publicJson: publicStateJson,
        privateContextsJson: privateContextsJsonByPlayerId,
      };
    },
  });

  await DAO.setGameStatus({
    gameId: props.gameId,
    gameStatus: 'inProgress',
  });
}
