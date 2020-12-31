import { useMachine } from '@xstate/react';
import { useCallback, useEffect } from 'react';
import { HydratedGameState } from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { createBufferStateMachine } from './BufferMachine';

/** The type-parameterized instance of the buffer machine for the Euchre game */
const BufferMachine = createBufferStateMachine<HydratedGameState>();

export function useStateBuffer(params: {
  initialHead: number;
  onHeadChanged?: (head: number) => void;
}) {
  const { initialHead, onHeadChanged } = params;

  const [bufferMachineState, dispatch] = useMachine(BufferMachine, {
    context: { head: initialHead },
  });
  const buffer = bufferMachineState.context;

  const currentGameState = buffer.currentIndexShowing
    ? buffer.gameStateSnapshots[buffer.currentIndexShowing]
    : null;

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

  useEffect(() => {
    if (buffer.head && onHeadChanged) {
      onHeadChanged(buffer.head);
    }
  }, [buffer.head, onHeadChanged]);

  return [currentGameState, addSnapshotToBuffer, dispatch] as [
    typeof currentGameState,
    typeof addSnapshotToBuffer,
    typeof dispatch
  ];
}
