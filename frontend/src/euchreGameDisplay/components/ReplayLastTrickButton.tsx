import Button from '@material-ui/core/Button';
import { ColorSchemes } from '../../style/AppStyle';
import { useColorSchemeStorage } from '../../uiHelpers/LocalStorageClient';

export function ReplayLastTrickButton() {
  const [colorSchemeId] = useColorSchemeStorage(0);
  const buttonColor = ColorSchemes[colorSchemeId].color;

  return (
    <Button
      variant="outlined"
      style={{ borderColor: buttonColor, color: buttonColor }}
    >
      Replay Last Trick
    </Button>
  );
}

/**
 * Scans the state buffer in reverse order and pulls out the last complete
 * set of game snapshots
 */
export function findLastTrickToReplay() {
  //
}
