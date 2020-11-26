import { useMachine } from '@xstate/react';
import { useEffect, useState } from 'react';
import FlexView from 'react-flexview/lib';
import { useEventSender, EventSender } from './EventSender';
import {
  ExperimentEvent,
  ExperimentStateMachine,
} from './ExperimentStateMachine';

const machine = ExperimentStateMachine;

export function Experiment() {
  useEffect(() => {
    document.title = 'Experiment';
  }, []);

  const [manualState, setManualState] = useState(machine.initialState);
  const [machineState, sendToMachine] = useMachine(machine);

  function applyEventToMachine(event: ExperimentEvent) {
    sendToMachine(event);

    const incrementedState = machine.transition(manualState, event);
    setManualState(incrementedState);
  }

  const addOneActionSend = useEventSender(
    { type: 'addOne' },
    applyEventToMachine
  );
  const subtractOneActionSend = useEventSender(
    { type: 'subtractOne' },
    applyEventToMachine
  );

  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).machineState = machineState;
  (window as any).manualState = manualState;
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <div style={{ padding: 20 }}>
      <EventSender {...addOneActionSend} />
      <EventSender {...subtractOneActionSend} />
      <FlexView>
        <FlexView column grow>
          <h3>Machine State</h3>
          <DebugJSON json={machineState} />
        </FlexView>
        <FlexView column grow>
          <h3>Manual State</h3>
          <DebugJSON json={manualState} />
        </FlexView>
      </FlexView>
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
