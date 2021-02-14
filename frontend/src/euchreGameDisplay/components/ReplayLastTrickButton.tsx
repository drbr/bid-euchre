import { ColorSchemeOutlineButton } from './ColorSchemeOutlineButton';

export function ReplayLastTrickButton() {
  return (
    <ColorSchemeOutlineButton onClick={() => void 0}>
      Replay Last Trick
    </ColorSchemeOutlineButton>
  );
}

/**
 * Scans the state buffer in reverse order and pulls out the last complete
 * set of game snapshots
 */
export function findLastTrickToReplay() {
  //
}
