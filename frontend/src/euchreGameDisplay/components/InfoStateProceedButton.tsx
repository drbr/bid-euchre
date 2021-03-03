import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useEffect, useState } from 'react';
import { UnscopedGameDisplayProps } from '../GameDisplayProps';

export const AUTO_PROCEED_MS = 10_000;

export type InfoStateProceedButtonProps = Pick<
  UnscopedGameDisplayProps,
  'unblockHead'
>;

/**
 * A "Proceed" button with a progress indicator, which automatically clicks the button after the
 * time limit. This button is used in "blocked" states where the global game state has already
 * advanced, but the individual player's view of the game stays blocked on this state until they
 * proceed (either manually or after the timeout).
 *
 * Playtesting has indicated that the word "Proceed" is confusing, so we're trying "OK" instead.
 */
export function InfoStateAutomaticProceedButton(
  props: InfoStateProceedButtonProps
) {
  const { unblockHead } = props;

  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const startTime = Date.now();

    function incrementProgress() {
      const elapsed = Date.now() - startTime;
      const percent = (elapsed / AUTO_PROCEED_MS) * 100;
      setProgressPercent(percent);
    }

    // 50 ms/frame @ 20 FPS
    const intervalId = setInterval(incrementProgress, 50);
    return () => clearInterval(intervalId);
  }, []);

  // Once progress is full, automatically unblock. Let the internal percent get
  // a little past 100 because the browser paint lags the internal state. This
  // way it'll look like the progress bar gets all the way across.
  useEffect(() => {
    if (progressPercent >= 115 && unblockHead) {
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
        OK
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
      OK
    </Button>
  );
}
