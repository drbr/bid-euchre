import * as _ from 'lodash';
import { PlayerIdentities } from '../../../frontend/src/gameLogic/apiContract/database/DataModel';
import { GameStateMachine } from '../../../frontend/src/gameLogic/euchreStateMachine/GameStateMachine';
import { serializeState } from '../../../frontend/src/gameLogic/stateMachineUtils/serializeAndHydrateState';
import { StartGameEvent } from '../../../frontend/src/gameLogic/stateMachineUtils/SpecialEvents';
import { transitionStateMachine } from '../../../frontend/src/gameLogic/stateMachineUtils/transitionStateMachine';
import { getInitialMachineState } from '../backendStateMachineUtils/getInitialMachineState';
import * as DAO from '../databaseHelpers/BackendDAO';
import executeNewGame from './executeNewGame';
import { storePublicAndPrivateSnapshotsFromTransition } from './incrementAndStoreState';

export async function initializeGameStates(params: {
  gameId: string;
  playerIdentities: PlayerIdentities;
}): Promise<void> {
  // Start the game by sending an event through the state machine service. One would think that we
  // can just give clients the initial state, but the initial state may not require the player to
  // act (or it may have side effects that need to be executed). Hence, we send a special action to
  // invoke the state machine and properly increment the game state to the first point that requires
  // player interaction.
  const startGameEvent: StartGameEvent = { type: 'START_GAME' };
  const nextStates = await transitionStateMachine(
    GameStateMachine,
    { hydratedState: getInitialMachineState() },
    startGameEvent,
    {
      initializeNewGame: () => executeNewGame().then((result) => result.gameId),
    }
  );
  const finalState = _.last(nextStates);
  if (!finalState) {
    throw new Error('START_GAME event did not result in a new game state!');
  }

  await DAO.transactionallySetGameStateFullJson({
    gameId: params.gameId,
    transactionUpdate: () => serializeState(finalState),
  });

  await storePublicAndPrivateSnapshotsFromTransition({
    gameId: params.gameId,
    nextStates,
    playerIdentities: params.playerIdentities,
  });

  // Once all the initial state is written, we can tell the clients that the game has started
  await DAO.setGameStatus({
    gameId: params.gameId,
    gameStatus: 'inProgress',
  });
}
