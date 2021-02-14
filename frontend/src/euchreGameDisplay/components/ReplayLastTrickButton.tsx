import Button from '@material-ui/core/Button';

export function ReplayLastTrickButton() {
  return <Button variant="contained">Replay Last Trick</Button>;
}

/**
 * Scans the state buffer in reverse order and pulls out the last complete
 * set of game snapshots
 */
export function findLastTrickToReplay() {
  //
}
