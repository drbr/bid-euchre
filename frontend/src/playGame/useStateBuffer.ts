import { useMachine } from '@xstate/react';
import { useCallback, useEffect } from 'react';
import { AnyEventObject } from 'xstate';
import { HydratedGameState } from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { createBufferStateMachine } from './BufferMachine';
import {
  BufferEvent,
  BufferMachineState,
  BufferStateValue,
  SendGameEventToServerEvent,
  StateBuffer,
} from './BufferMachineTypes';

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
  sendGameEventToServer: (
    currentGameState: HydratedGameState,
    gameEvent: AnyEventObject
  ) => Promise<void>;
}) {
  const { initialHead, onHeadChanged, sendGameEventToServer } = params;

  const sendGameEvent = useCallback(
    (
      context: StateBuffer<HydratedGameState>,
      ev: BufferEvent<HydratedGameState>
    ) => {
      const bufferEvent = ev as SendGameEventToServerEvent;
      const gameEvent = bufferEvent.gameEvent;
      const currentGameState =
        context.gameStateSnapshots[context.currentIndexShowing ?? 0];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return sendGameEventToServer(currentGameState!, gameEvent);
    },
    [sendGameEventToServer]
  );

  const [bufferMachineState, dispatchToBuffer] = useMachine(BufferMachine, {
    context: { head: initialHead },
    services: { sendGameEvent },
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

  /* Add stuff to the window for debugging */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).stateBuffer = buffer;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return {
    currentGameState,
    addSnapshotToBuffer,
    dispatchToBuffer,
    bufferMachineMode,
  };
}
