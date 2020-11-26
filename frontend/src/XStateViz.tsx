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
    document.body.appendChild(iframe);
    iFrameElement = iframe;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyStateMachine = StateMachine<any, any, any, any>;

export type XStateVizProps = {
  machine: AnyStateMachine;
};

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
    document.title = 'State Machine';
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
