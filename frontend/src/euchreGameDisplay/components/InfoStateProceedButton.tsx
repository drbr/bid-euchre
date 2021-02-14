import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useEffect, useState } from 'react';
import { UnscopedGameDisplayProps } from '../GameDisplayProps';

export const AUTO_PROCEED_MS = 4_000;

export type InfoStateProceedButtonProps = Pick<
  UnscopedGameDisplayProps,
  'unblockHead'
>;

/**
 * A "Proceed" button with a progress indicator, which automatically clicks the button after the
 * time limit.
 */
export function InfoStateAutomaticProceedButton(
  props: InfoStateProceedButtonProps
) {
  const { unblockHead } = props;

  const [progressPercent, setProgressPercent] = useState(0);

  // Update progress bar in 200 increments over its width
  useEffect(() => {
    const intervalId = setInterval(
      () => setProgressPercent((p) => p + 0.5),
      AUTO_PROCEED_MS / 200
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
      <Button onClick={unblockHead} variant="contained">
        Proceed
      </Button>
      <LinearProgress
        style={{ marginTop: 8 }}
        variant="determinate"
        value={Math.min(progressPercent, 100)}
      />
    </div>
  );
}

/**
 * A "Proceed" button without the progress indicator; the user must manually click the button before
 * moving on.
 */
export function InfoStateManualProceedButton(
  props: InfoStateProceedButtonProps
) {
  const { unblockHead } = props;

  if (!unblockHead) {
    return null;
  }

  return (
    <Button onClick={unblockHead} variant="contained" color="primary">
      Proceed
    </Button>
  );
}
