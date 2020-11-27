import FlexView from 'react-flexview/lib';
import { AnyEventObject } from 'xstate';
import { PublicGameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { sendGameEvent } from '../firebase/CloudFunctionsClient';
import { BiddingContext } from '../gameLogic/stateMachine/BiddingStateTypes';
import { AllContext } from '../gameLogic/stateMachine/GameStateMachine';
import { GameState } from '../gameLogic/stateMachine/GameStateTypes';
import { GameLayout } from './GameLayout';

export type PlayGameProps = {
  gameId: string;
  playerId: string | null;
  gameConfig: PublicGameConfig;
  gameState: GameState;
  seatedAt: Position;
};

export function PlayGame(props: PlayGameProps) {
  // const privateGameState = useObservedState(
  //   { gameId: props.gameId, playerId: props.playerId },
  //   (params, callback) => {
  //     if (params.playerId) {
  //       return DAO.subscribeToPrivateGameState(
  //         params as { gameId: string; playerId: string },
  //         callback
  //       );
  //     }
  //   }
  // );

  function sendEvent(event: AnyEventObject) {
    void sendGameEvent({
      event,
      existingEventCount: props.gameState.context.eventCount,
      gameId: props.gameId,
      playerId: props.playerId,
    });
  }

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // (window as any).privateGameState = privateGameState;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const bids =
    ((props.gameState.context as AllContext) as BiddingContext).bids || {};

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
            <p>Event count: {props.gameState.context.eventCount}</p>
            <button onClick={() => sendEvent({ type: 'NEXT' })}>
              Send Next Event
            </button>
            <button onClick={() => sendEvent({ type: 'PLAYER_BID', bid: 2 })}>
              Send Bid Event 2
            </button>
            <button onClick={() => sendEvent({ type: 'PLAYER_BID', bid: 3 })}>
              Send Bid Event 3
            </button>
            <button onClick={() => sendEvent({ type: 'PLAYER_BID', bid: 4 })}>
              Send Bid Event 4
            </button>
            <button onClick={() => sendEvent({ type: 'PLAYER_BID', bid: 5 })}>
              Send Bid Event 5
            </button>
          </FlexView>
        }
        viewpoint={props.seatedAt}
      />
    </div>
  );
}
