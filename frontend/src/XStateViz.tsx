import { useEffect, useState } from 'react';
import { StateMachine } from 'xstate';
import { useMachine } from '@xstate/react';
import { inspect } from '@xstate/inspect';

let iFrameElement: HTMLIFrameElement | null = null;

function createIFrame() {
  if (!iFrameElement) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('id', 'xstate');
    iframe.setAttribute('height', '100%');
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('style', 'position: absolute; border: 0;');

    document.body.appendChild(iframe);
    iFrameElement = iframe;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyStateMachine = StateMachine<any, any, any, any>;

export type XStateVizProps = {
  machine: AnyStateMachine;
};

/**
 * Renders the XState Inspector in a manner similar to the XState Visualizer (with a self-contained
 * state machine), rather than connecting to an instance of the machine already running in an app.
 *
 * The iframe is set up to take up the whole page, so it's suggested that this be rendered in its
 * own route or something similar.
 */
export function XStateViz(props: XStateVizProps) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    createIFrame();

    inspect({
      url: 'https://statecharts.io/inspect',
      iframe: iFrameElement,
    });

    setInitialized(true);
  }, []);

  useEffect(() => {
    document.title = props.machine.id;
  });

  if (initialized) {
    return <StateMachineInstance {...props} />;
  } else {
    return null;
  }
}

function StateMachineInstance(props: XStateVizProps) {
  useMachine(props.machine, { devTools: true });
  return <div></div>;
}
