import { asEffect, useMachine } from '@xstate/react';
import { Reducer, useEffect, useReducer } from 'react';
import FlexView from 'react-flexview/lib';
import { State } from 'xstate';
import { subscribeToEntireDatabase } from '../firebase/FrontendDAO';
import { useObservedState } from '../uiHelpers/useObservedState';
import { EventSender, useEventSenderProps } from './EventSender';
import {
  ExperimentEvent,
  ExperimentStateMachine,
  uiAlertAction,
} from './ExperimentStateMachine';
import { runIsolatedMachine } from './IsolatedMachine';

const machine = ExperimentStateMachine;
const machineWithActions = machine.withConfig({
  actions: {
    uiAlert: uiAlertAction,
    uiAlertEffect: asEffect(uiAlertAction),
  },
});

function manualStateReducer<T>(prev: T, next: T): T {
  return next;
}

export function Experiment() {
  useEffect(() => {
    document.title = 'Experiment';
  });

  useEffect(() => {
    runIsolatedMachine();
  }, []);

  const initialState = machine.resolveState(
    State.create(persistedExperimentState)
  );

  const [manualState, setManualState] = useReducer(
    manualStateReducer as Reducer<typeof initialState, typeof initialState>,
    initialState
  );
  const [machineState, sendToMachine] = useMachine(machine, {
    state: persistedExperimentState,
    actions: {
      uiAlert: uiAlertAction,
      uiAlertEffect: asEffect(uiAlertAction),
    },
  });

  function applyEventToMachine(event: ExperimentEvent) {
    // void navigate('/game', { replace: false });
    setTimeout(() => {
      sendToMachine(event);

      const incrementedState = machineWithActions.transition(
        manualState,
        event
      );
      setManualState(incrementedState);
    }, 1000);
  }

  const databaseValue = useObservedState({}, subscribeToEntireDatabase);

  const addOneActionSend = useEventSenderProps(
    { type: 'addOne', value: undefined },
    applyEventToMachine,
    machine,
    manualState
  );
  const subtractOneActionSend = useEventSenderProps(
    { type: 'subtractOne', value: undefined },
    applyEventToMachine,
    machine,
    manualState
  );
  const addXActionSend = useEventSenderProps(
    { type: 'addX', value: 4 },
    applyEventToMachine,
    machine,
    manualState
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
      <EventSender {...addXActionSend} />
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

const persistedExperimentState = JSON.parse(`
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
