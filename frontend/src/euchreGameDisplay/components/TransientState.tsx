import { useEffect } from 'react';

export function TransientState(props: { substateName: string }) {
  useEffect(() => {
    console.warn(
      `Rendering transient state: ${props.substateName}. These states should never be rendered in the UI.`
    );
  }, [props.substateName]);

  return (
    <div>
      <p>{props.substateName}</p>
    </div>
  );
}
