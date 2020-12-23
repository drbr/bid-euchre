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
  /**
   * Send this prop to launch the visualizer in-place (in an iframe) and run the machine standalone.
   */
  machine?: AnyStateMachine;

  /**
   * Send this prop to render the given element, but attach it to a visualizer that opens in a new
   * tab.
   */
  childrenWithMachine?: JSX.Element;

  /**
   * The title of the browser tab.
   */
  title?: string;
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

  const useIFrame = props.childrenWithMachine ? false : true;

  useEffect(() => {
    createIFrame();

    inspect({
      url: 'https://statecharts.io/inspect',
      iframe: useIFrame ? iFrameElement : false,
    });

    setInitialized(true);
  }, [useIFrame]);

  useEffect(() => {
    const customTitle = props.title ?? props.machine?.id;
    if (customTitle) {
      document.title = customTitle;
    }
  });

  if (initialized && props.machine) {
    return <StateMachineInstance machine={props.machine} />;
  } else if (initialized && props.childrenWithMachine) {
    return props.childrenWithMachine;
  } else {
    return null;
  }
}

function StateMachineInstance(props: { machine: AnyStateMachine }) {
  useMachine(props.machine, { devTools: true });
  return <div></div>;
}
