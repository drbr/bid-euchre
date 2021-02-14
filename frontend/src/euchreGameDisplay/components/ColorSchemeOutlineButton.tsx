import Button from '@material-ui/core/Button';
import { ColorSchemes } from '../../style/AppStyle';
import { useColorSchemeStorage } from '../../uiHelpers/LocalStorageClient';

/**
 * A MUI outline button whose color respects the app's color scheme.
 */
export function ColorSchemeOutlineButton(props: {
  onClick: () => void;
  children: string;
}) {
  const [colorSchemeId] = useColorSchemeStorage(0);
  const buttonColor = ColorSchemes[colorSchemeId].color;

  return (
    <Button
      variant="outlined"
      style={{ borderColor: buttonColor, color: buttonColor }}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}
