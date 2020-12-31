import { useCallback } from 'react';
import { AnyEventObject } from 'xstate';
import { InProgressGameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import * as DAO from '../firebase/FrontendDAO';
import { GameStateConfig } from '../gameLogic/euchreStateMachine/GameStateTypes';
import { hydrateStateFromConfig } from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { sendGameEventToServer } from '../routines/sendGameEventToServer';
import { Subscription, useSubscription } from '../uiHelpers/useSubscription';
import { PlayGameWithSingleStatePure } from './PlayGameWithState';
import { useStateBuffer } from './useStateBuffer';

export type PlayGameProps = {
  gameId: string;
  playerId: string | null;
  gameConfig: InProgressGameConfig;
  seatedAt: Position | null;
};

export function PlayGame(props: PlayGameProps) {
  const { gameId, playerId } = props;

  const [currentGameState, dispatchToStateBuffer] = useBufferWithGameState(props);

  const sendGameEventToStateMachine = useCallback(
    (event: AnyEventObject) => {
      void sendGameEventToServer({
        gameId,
        playerId,
        currentGameState,
        event,
      });
    },
    [currentGameState, gameId, playerId]
  );

  if (!currentGameState) {
    return <div>Loading…</div>;
  }

  return (
    <PlayGameWithSingleStatePure
      {...props}
      gameState={currentGameState.hydratedState}
      sendGameEvent={sendGameEventToStateMachine}
      dispatchStateBufferAction={dispatchToStateBuffer}
    />
  );
}

function useBufferWithGameState(props: {
  gameId: string;
  playerId: string | null;
}) {
  const { gameId, playerId } = props;

  const [
    currentGameState,
    addSnapshotToBuffer,
    dispatchToBuffer,
  ] = useStateBuffer();

  const processReceivedGameState = useCallback(
    (data: GameStateConfig | null) => {
      if (!data) {
        throw new Error(`Game with ID ${gameId} was not found!`);
      } else {
        const hydrated = hydrateStateFromConfig(data);
        addSnapshotToBuffer(hydrated);
      }
    },
    [addSnapshotToBuffer, gameId]
  );

  useSubscription(
    { gameId, playerId },
    subscribeToPublicOrPrivateGameState,
    processReceivedGameState
  );

  return [currentGameState, dispatchToBuffer] as [
    typeof currentGameState,
    typeof dispatchToBuffer
  ];
}

const subscribeToPublicOrPrivateGameState: Subscription<
  { gameId: string; playerId: string | null },
  GameStateConfig
> = (params, callback) => {
  if (params.playerId) {
    return DAO.subscribeToPrivateGameState(
      { gameId: params.gameId, playerId: params.playerId },
      callback
    );
  } else {
    return DAO.subscribeToPublicGameState({ gameId: params.gameId }, callback);
  }
};
