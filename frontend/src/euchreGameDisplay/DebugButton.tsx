export type DebugButtonProps<E> = {
  event: E;
  sendGameEvent: (event: E) => void;
  isEventValid: (event: E) => boolean;
  text: (event: E) => string;
};

export function DebugButton<E>(props: DebugButtonProps<E>) {
  const enabled = props.isEventValid(props.event);
  const text = props.text(props.event);
  return (
    <button
      disabled={!enabled}
      onClick={() => props.sendGameEvent(props.event)}
    >
      {text}
    </button>
  );
}
