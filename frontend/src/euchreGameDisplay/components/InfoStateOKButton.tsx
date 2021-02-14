import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useEffect, useState } from 'react';
import { UnscopedGameDisplayProps } from '../GameDisplayProps';

export const AUTO_PROCEED_MS = 3000;

export function InfoStateOKButton(
  props: Pick<UnscopedGameDisplayProps, 'unblockHead'>
) {
  const { unblockHead } = props;

  const [progressPercent, setProgressPercent] = useState(0);

  // Update progress bar in 1000 increments over its width
  useEffect(() => {
    const intervalId = setInterval(
      () => setProgressPercent((p) => p + 0.1),
      AUTO_PROCEED_MS / 1000
    );
    return () => clearInterval(intervalId);
  }, []);

  // Once progress is full, automatically unblock
  useEffect(() => {
    if (progressPercent >= 110 && unblockHead) {
      unblockHead();
    }
  }, [progressPercent, unblockHead]);

  // If the buffer machine doesn't expose a way to unblock the current head, that means
  // that we're not in a state where we can advance.
  if (!unblockHead) {
    return null;
  }

  return (
    <div style={{ display: 'inline-block' }}>
      <Button onClick={unblockHead} variant="contained" color="primary">
        Proceed
      </Button>
      <LinearProgress
        style={{ marginTop: 8 }}
        variant="determinate"
        value={progressPercent}
      />
    </div>
  );
}
