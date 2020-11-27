import { asEffect, useMachine } from '@xstate/react';
import { useEffect, useState } from 'react';
import FlexView from 'react-flexview/lib';
import { State } from 'xstate';
import { subscribeToEntireDatabase } from '../firebase/FrontendDAO';
import { useObservedState } from '../uiHelpers/useObservedState';
import { useEventSender, EventSender } from './EventSender';
import {
  ExperimentEvent,
  ExperimentStateMachine,
  uiAlertAction,
} from './ExperimentStateMachine';

const machine = ExperimentStateMachine;
const machineWithActions = machine.withConfig({
  actions: {
    uiAlert: uiAlertAction,
    uiAlertEffect: asEffect(uiAlertAction),
  },
});

export function Experiment() {
  useEffect(() => {
    document.title = 'Experiment';
  }, []);

  const [manualState, setManualState] = useState(
    machine.resolveState(State.create(persistedState))
    // machine.initialState
  );
  const [machineState, sendToMachine] = useMachine(machine, {
    state: persistedState,
    actions: {
      uiAlert: uiAlertAction,
      uiAlertEffect: asEffect(uiAlertAction),
    },
  });

  function applyEventToMachine(event: ExperimentEvent) {
    sendToMachine(event);

    const incrementedState = machineWithActions.transition(manualState, event);
    setManualState(incrementedState);
  }

  const databaseValue = useObservedState({}, subscribeToEntireDatabase);

  const addOneActionSend = useEventSender(
    { type: 'addOne' },
    applyEventToMachine
  );
  const subtractOneActionSend = useEventSender(
    { type: 'subtractOne' },
    applyEventToMachine
  );

  /* eslint-disable @typescript-eslint/no-explicit-any */
  (window as any).databaseValue = databaseValue;
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

const persistedState = JSON.parse(`
{
  "actions": [],
  "activities": {},
  "meta": {},
  "events": [],
  "value": {
    "recordEvents": {},
    "runExperiment": "count"
  },
  "context": {
    "value": 1,
    "events": [
      {
        "type": "addOne"
      }
    ]
  },
  "_event": {
    "name": "addOne",
    "data": {
      "type": "addOne"
    },
    "$$type": "scxml",
    "type": "external"
  },
  "_sessionid": "x:1",
  "event": {
    "type": "addOne"
  },
  "historyValue": {
    "current": {
      "recordEvents": {},
      "runExperiment": "count"
    },
    "states": {
      "runExperiment": {
        "current": "count",
        "states": {}
      }
    }
  },
  "history": {
    "actions": [],
    "activities": {},
    "meta": {},
    "events": [],
    "value": {
      "recordEvents": {},
      "runExperiment": "count"
    },
    "context": {
      "value": 0,
      "events": []
    },
    "_event": {
      "name": "xstate.init",
      "data": {
        "type": "xstate.init"
      },
      "$$type": "scxml",
      "type": "external"
    },
    "_sessionid": "x:1",
    "event": {
      "type": "xstate.init"
    },
    "children": {},
    "done": false
  },
  "children": {},
  "done": false,
  "changed": true
}
`);
