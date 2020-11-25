import { Machine, assign } from 'xstate';
import { useMachine } from '@xstate/react';
import { useEffect, useState } from 'react';
import { inspect } from '@xstate/inspect';

type StateMachineContext = { count: number };

const toggleMachine = Machine<StateMachineContext>({
  id: 'foo bar',
  initial: 'inactive',
  context: {
    count: 0,
  },
  states: {
    inactive: {
      on: { TOGGLE: 'active' },
    },
    active: {
      entry: assign({ count: (ctx) => ctx.count + 1 }),
      on: { TOGGLE: 'inactive' },
    },
  },
});

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

export function StateMachineViz() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    createIFrame();

    inspect({
      url: 'https://statecharts.io/inspect',
      iframe: iFrameElement,
    });

    setInitialized(true);
  }, []);

  if (initialized) {
    return <StateMachineInstance />;
  } else {
    return null;
  }
}

function StateMachineInstance() {
  useMachine(toggleMachine, { devTools: true });
  return <div></div>;
}
