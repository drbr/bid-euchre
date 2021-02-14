import Button from '@material-ui/core/Button';
import { UnscopedGameDisplayProps } from '../GameDisplayProps';

export function InfoStateOKButton(
  props: Pick<UnscopedGameDisplayProps, 'unblockHead'>
) {
  // If the buffer machine doesn't expose a way to unblock the current head, that means
  // that we're not in a state where we can advance.
  if (!props.unblockHead) {
    return null;
  }

  return (
    <Button onClick={props.unblockHead} variant="contained" color="primary">
      Proceed
    </Button>
  );
}
