import { useMachine } from '@xstate/react';
import { useCallback } from 'react';
import { HydratedGameState } from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { BufferEvent, createBufferStateMachine } from './BufferMachine';

/** The type-parameterized instance of the buffer machine for the Euchre game */
const BufferMachine = createBufferStateMachine<HydratedGameState>();

export function useStateBuffer(): [
  HydratedGameState | null | undefined,
  (snapshot: HydratedGameState) => void,
  (event: BufferEvent<HydratedGameState>) => void
] {
  const [bufferMachineState, dispatch] = useMachine(BufferMachine);
  const buffer = bufferMachineState.context;

  const currentGameState = buffer.currentIndexShowing
    ? buffer.gameStateSnapshots[buffer.currentIndexShowing]
    : null;
  console.log('State buffer: %o', buffer);

  const addSnapshotToBuffer = useCallback(
    (snapshot: HydratedGameState) => {
      dispatch({
        type: 'RECV_SNAPSHOT',
        snapshot: snapshot,
        index: snapshot.hydratedState.context.eventCount,
      });
    },
    [dispatch]
  );

  return [currentGameState, addSnapshotToBuffer, dispatch];
}
