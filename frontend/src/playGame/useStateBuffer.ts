import { useMachine } from '@xstate/react';
import { useCallback, useEffect, useMemo } from 'react';
import { AnyEventObject } from 'xstate';
import { flattenGameMeta } from '../gameLogic/stateMachineUtils/MetaUtils';
import { HydratedGameState } from '../gameLogic/stateMachineUtils/serializeAndHydrateState';
import { createBufferStateMachine, headShouldBlock } from './BufferMachine';
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
  | { mode: 'loading' }
  | { mode: 'head'; manuallyBlocked: boolean }
  | { mode: 'detached' }
  | { mode: 'sendingGameEvent' };
const loadingState: BufferStateValue = 'loading';
const headState: BufferStateValue = { loaded: 'showHead' };
const detachedState: BufferStateValue = { loaded: 'showSnapshotDetached' };
const sendingEventState: BufferStateValue = 'sendingGameEvent';

function getBufferMachineMode<S>(
  state: BufferMachineState<S>
): BufferMachineMode {
  if (state.matches(loadingState)) {
    return { mode: 'loading' };
  } else if (state.matches(headState)) {
    const manuallyBlocked = headShouldBlock(state.context);
    return { mode: 'head', manuallyBlocked };
  } else if (state.matches(detachedState)) {
    return { mode: 'detached' };
  } else if (state.matches(sendingEventState)) {
    return { mode: 'sendingGameEvent' };
  } else {
    throw new Error('Buffer machine state did not match any expected value');
  }
}
export function useStateBuffer(params: {
  participatingInGame: boolean;
  initialHead: number;
  onHeadChanged?: (head: number) => void;
  sendGameEventToServer: (
    currentGameState: HydratedGameState,
    gameEvent: AnyEventObject
  ) => Promise<void>;
}) {
  const {
    participatingInGame,
    initialHead,
    onHeadChanged,
    sendGameEventToServer,
  } = params;

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
      return sendGameEventToServer(currentGameState!.snapshot, gameEvent);
    },
    [sendGameEventToServer]
  );

  const [bufferMachineState, dispatchToBuffer] = useMachine(BufferMachine, {
    context: { head: initialHead },
    services: { sendGameEvent },
    devTools: true,
  });
  const buffer = bufferMachineState.context;
  const bufferMachineMode = getBufferMachineMode(bufferMachineState);

  const currentGameState = buffer.currentIndexShowing
    ? buffer.gameStateSnapshots[buffer.currentIndexShowing]?.snapshot
    : null;

  const addSnapshotToBuffer = useCallback(
    (snapshot: HydratedGameState) => {
      // States should only block for the active players. We should let spectators see the game
      // play out in near-real time without needing to manually advance the UI.
      const meta = flattenGameMeta(snapshot);
      const blockType =
        participatingInGame && meta.blocking ? 'block' : 'linger';

      dispatchToBuffer({
        type: 'RECV_SNAPSHOT',
        snapshot: snapshot,
        index: snapshot.hydratedState.context.eventCount,
        blockType: blockType,
      });
    },
    [dispatchToBuffer, participatingInGame]
  );

  /**
   * This function is used for the UI to manually unblock a blocked state. It will be defined only
   * when such a state is currently active – the UI can use the existence of the function to
   * determine whether or not to show the unblock control.
   *
   * Even if a state node is configured as `blocking` via its metadata, we may not display it as
   * blocked (see `addSnapshotToBuffer`), so we use the block type known by the state buffer,
   * not the one initially configured in the state node.
   */
  const unblockHead: (() => void) | null = useMemo(() => {
    const showingBlockedState =
      bufferMachineMode.mode === 'head' && bufferMachineMode.manuallyBlocked;
    return showingBlockedState
      ? () => dispatchToBuffer({ type: 'UNBLOCK_HEAD' })
      : null;
  }, [dispatchToBuffer, bufferMachineMode]);

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
    unblockHead,
    bufferMachineMode,
  };
}
