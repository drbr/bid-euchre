import { useState } from 'react';
import { Event, EventObject, State, StateMachine, StateSchema } from 'xstate';

export function useEventSenderProps<
  C,
  SS extends StateSchema,
  E extends EventObject
>(
  initialAction: E,
  sendEvent: (event: E) => void,
  machine: StateMachine<C, SS, E>,
  currentState: State<C, E>
): EventSenderProps<C, SS, E> {
  const initialActionText = JSON.stringify(initialAction);
  const [actionText, setActionText] = useState<string>(initialActionText);
  return { actionText, setActionText, sendEvent, machine, currentState };
}

export type EventSenderProps<
  C,
  SS extends StateSchema,
  E extends EventObject
> = {
  actionText: string;
  setActionText: React.Dispatch<React.SetStateAction<string>>;
  sendEvent: (event: E) => void;
  machine: StateMachine<C, SS, E>;
  currentState: State<C, E>;
};

export function EventSender<C, SS extends StateSchema, E extends EventObject>(
  props: EventSenderProps<C, SS, E>
) {
  let eventObj: E | null = null;
  try {
    eventObj = JSON.parse(props.actionText);
  } catch (e) {
    /* It's okay if it can't parse */
  }
  const isEventValidForTransition = eventObj
    ? willEventApply(props.machine, props.currentState, eventObj)
    : null;
  return (
    <div>
      <input
        value={props.actionText}
        onChange={(e) => props.setActionText(e.target.value)}
      />
      <button
        disabled={!eventObj}
        onClick={() => eventObj && props.sendEvent(eventObj)}
      >
        Send
      </button>
      {isEventValidForTransition !== null ? (
        <span>{isEventValidForTransition ? '✅' : '❌'}</span>
      ) : null}
    </div>
  );
}

function willEventApply<C, SS extends StateSchema, E extends EventObject>(
  machine: StateMachine<C, SS, E>,
  currentState: State<C, E>,
  event: Event<E>
): boolean {
  try {
    return machine.transition(currentState, event).changed ?? false;
  } catch (e) {
    return false;
  }
}
