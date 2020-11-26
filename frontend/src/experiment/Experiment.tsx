import { useState } from 'react';
import {
  ExperimentEvent,
  ExperimentStateMachine,
} from './ExperimentStateMachine';

const machine = ExperimentStateMachine;

export function Experiment() {
  const [state, setState] = useState(machine.initialState);

  // const [state, send] = useMachine(machine);
  const [actionText, setActionText] = useState('{"type":"poke"}');

  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).machineState = state;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  function applyEventToMachine(event: ExperimentEvent) {
    const incrementedState = machine.transition(state, event);
    setState(incrementedState);
  }

  return (
    <div style={{ padding: 20 }}>
      <input
        value={actionText}
        onChange={(e) => setActionText(e.target.value)}
      />
      <button onClick={() => applyEventToMachine(JSON.parse(actionText))}>
        Send
      </button>
      <DebugJSON json={state} />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DebugJSON(props: { json: any }) {
  return (
    <p
      style={{
        whiteSpace: 'pre-wrap',
        textAlign: 'left',
        fontFamily: 'monospace',
      }}
    >
      {JSON.stringify(props.json, null, 2)}
    </p>
  );
}
