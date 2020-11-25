import { useMachine, useService } from '@xstate/react';
import { useState } from 'react';
import { GameStateMachine } from '../gameLogic/stateMachine/GameStateMachine';

export function SubmachineGameTest() {
  const [state, send] = useMachine(GameStateMachine);
  const [actionText, setActionText] = useState('{"type":"poke"}');
  const stateString = JSON.stringify(state, null, 2);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).machineState = state;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div>
      <input
        value={actionText}
        onChange={(e) => setActionText(e.target.value)}
      />
      <button onClick={() => send(JSON.parse(actionText))}>Send</button>
      <p style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{stateString}</p>
    </div>
  );
}
