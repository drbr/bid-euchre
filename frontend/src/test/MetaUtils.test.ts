import { flattenGameMeta } from '../gameLogic/stateMachineUtils/MetaUtils';
import { HydratedGameState } from '../gameLogic/stateMachineUtils/serializeAndHydrateState';

describe('flattenGameMeta', () => {
  test('should flatten meta object as documented', () => {
    const inputMeta = {
      'EuchreStateMachine.runGame': {
        message: 'In the game',
      },
      'EuchreStateMachine.runGame.round.bidding.allPlayersPassedInfo': {
        blocking: true,
      },
    };

    const expectedOutput = {
      message: 'In the game',
      blocking: true,
    };

    const hydratedStateWithInputMeta = {
      hydratedState: {
        meta: inputMeta,
      },
    } as HydratedGameState;

    const result = flattenGameMeta(hydratedStateWithInputMeta);
    expect(result).toEqual(expectedOutput);
  });
});
