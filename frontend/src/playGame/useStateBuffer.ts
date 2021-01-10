import { useMachine } from '@xstate/react';
import { useCallback, useEffect } from 'react';
import { HydratedGameState } from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { createBufferStateMachine } from './BufferMachine';
import { BufferMachineState, BufferStateValue } from './BufferMachineTypes';

/** The type-parameterized instance of the buffer machine for the Euchre game */
const BufferMachine = createBufferStateMachine<HydratedGameState>();

export type BufferMachineMode =
  | 'loading'
  | 'head'
  | 'detached'
  | 'sendingGameEvent';
const loadingState: BufferStateValue = 'loading';
const headState: BufferStateValue = { loaded: 'showHead' };
const detachedState: BufferStateValue = { loaded: 'showSnapshotDetached' };
const sendingEventState: BufferStateValue = 'sendingGameEvent';

function getBufferMachineMode<S>(
  state: BufferMachineState<S>
): BufferMachineMode {
  if (state.matches(loadingState)) {
    return 'loading';
  } else if (state.matches(headState)) {
    return 'head';
  } else if (state.matches(detachedState)) {
    return 'detached';
  } else if (state.matches(sendingEventState)) {
    return 'sendingGameEvent';
  } else {
    throw new Error('Buffer machine state did not match any expected value');
  }
}

export function useStateBuffer(params: {
  initialHead: number;
  onHeadChanged?: (head: number) => void;
}) {
  const { initialHead, onHeadChanged } = params;

  const [bufferMachineState, dispatchToBuffer] = useMachine(BufferMachine, {
    context: { head: initialHead },
  });
  const buffer = bufferMachineState.context;
  const bufferMachineMode = getBufferMachineMode(bufferMachineState);

  const currentGameState = buffer.currentIndexShowing
    ? buffer.gameStateSnapshots[buffer.currentIndexShowing]
    : null;

  const addSnapshotToBuffer = useCallback(
    (snapshot: HydratedGameState) => {
      dispatchToBuffer({
        type: 'RECV_SNAPSHOT',
        snapshot: snapshot,
        index: snapshot.hydratedState.context.eventCount,
      });
    },
    [dispatchToBuffer]
  );

  useEffect(() => {
    if (buffer.head && onHeadChanged) {
      onHeadChanged(buffer.head);
    }
  }, [buffer.head, onHeadChanged]);

  return {
    currentGameState,
    addSnapshotToBuffer,
    dispatchToBuffer,
    bufferMachineMode,
  };
}
