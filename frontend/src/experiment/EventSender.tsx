import { useState } from 'react';

export function useEventSender<E>(
  initialAction: E,
  sendEvent: (event: E) => void
): EventSenderProps<E> {
  const initialActionText = JSON.stringify(initialAction);
  const [actionText, setActionText] = useState<string>(initialActionText);
  return { actionText, setActionText, sendEvent };
}

export type EventSenderProps<E> = {
  actionText: string;
  setActionText: React.Dispatch<React.SetStateAction<string>>;
  sendEvent: (event: E) => void;
};

export function EventSender<E>(props: EventSenderProps<E>) {
  return (
    <div>
      <input
        value={props.actionText}
        onChange={(e) => props.setActionText(e.target.value)}
      />
      <button onClick={() => props.sendEvent(JSON.parse(props.actionText))}>
        Send
      </button>
    </div>
  );
}
