import FlexView from 'react-flexview/lib';
import { AnyEventObject } from 'xstate';
import { PublicGameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { sendGameEvent } from '../firebase/CloudFunctionsClient';
import * as DAO from '../firebase/FrontendDAO';
import { BiddingContext } from '../gameLogic/stateMachine/BiddingStateTypes';
import { AllContext } from '../gameLogic/stateMachine/GameStateMachine';
import { GameState } from '../gameLogic/stateMachine/GameStateTypes';
import { useObservedState } from '../uiHelpers/useObservedState';
import { GameLayout } from './GameLayout';

export type PlayGameProps = {
  gameId: string;
  playerId: string | null;
  gameConfig: PublicGameConfig;
  seatedAt: Position;
};

export function PlayGame(props: PlayGameProps) {
  const { gameId, playerId } = props;

  const gameState = useObservedState(
    { gameId },
    DAO.subscribeToGameMachineState,
    (prev, next) => {
      const prevCount = prev.context.eventCount;
      const nextCount = next.context.eventCount;
      console.log(next.value);
      if (nextCount > prevCount + 1) {
        console.warn(
          `Possible error in state machine; trying to update game state from event count ${prevCount} to ${nextCount}`
        );
        console.log('Previous state:');
        console.log(prev);
        console.log('Next state:');
        console.log(next);
      }
      return true;
    }
  );

  // const privateGameState = useObservedState(
  //   { gameId, playerId },
  //   privateGameStateSubscription
  // );

  function sendEventToStateMachine(event: AnyEventObject) {
    void sendGameEvent({
      event,
      existingEventCount: (gameState as GameState).context.eventCount,
      gameId,
      playerId,
    });
  }

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).gameState = gameState;
  // (window as any).privateGameState = privateGameState;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  if (
    gameState === 'loading' ||
    gameState === 'gameNotFound'
    // privateGameState === 'loading' ||
    // privateGameState === 'gameNotFound'
  ) {
    return <div></div>;
  }

  const bids = ((gameState.context as AllContext) as BiddingContext).bids || {};

  return (
    <div>
      <p>
        {props.playerId ? null : 'You are a spectator of the current game!'}
      </p>
      <GameLayout
        renderPlayerElement={(position) => (
          <FlexView column>
            <div>{props.gameConfig.playerFriendlyNames[position]}</div>
            <div>{bids[position]}</div>
          </FlexView>
        )}
        tableCenterElement={
          <FlexView column>
            <p>Event count: {gameState.context.eventCount}</p>
            <button onClick={() => sendEventToStateMachine({ type: 'NEXT' })}>
              Send Next Event
            </button>
            <button
              onClick={() =>
                sendEventToStateMachine({ type: 'PLAYER_BID', bid: 2 })
              }
            >
              Send Bid Event 2
            </button>
            <button
              onClick={() =>
                sendEventToStateMachine({ type: 'PLAYER_BID', bid: 3 })
              }
            >
              Send Bid Event 3
            </button>
            <button
              onClick={() =>
                sendEventToStateMachine({ type: 'PLAYER_BID', bid: 4 })
              }
            >
              Send Bid Event 4
            </button>
            <button
              onClick={() =>
                sendEventToStateMachine({ type: 'PLAYER_BID', bid: 5 })
              }
            >
              Send Bid Event 5
            </button>
          </FlexView>
        }
        viewpoint={props.seatedAt}
      />
    </div>
  );
}

// const privateGameStateSubscription: Subscription<
//   { gameId: string; playerId: string | null },
//   PlayerPrivateGameState
// > = (params, callback) => {
//   if (params.playerId) {
//     return DAO.subscribeToPrivateGameState(
//       { gameId: params.gameId, playerId: params.playerId },
//       callback
//     );
//   }
// };
