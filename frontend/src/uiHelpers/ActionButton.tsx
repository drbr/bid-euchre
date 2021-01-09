import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ComponentPropsWithoutRef } from 'react';
import { classes } from 'typestyle';
import { absolutePositionFill, flexCenterChild } from '../style/LayoutStyles';

export type ActionButtonProps = ComponentPropsWithoutRef<typeof Button> & {
  loading?: boolean;
};

/**
 * A Material UI button with a `loading` prop, which, if true, displays a spinner instead of the
 * button text
 */
export function ActionButton(props: ActionButtonProps) {
  const { children, loading, disabled: disabledProp, ...restProps } = props;

  const isDisabled = disabledProp || loading;

  const contents = (
    <div style={{ position: 'relative' }}>
      <span style={{ visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </span>
      {loading ? (
        <div className={classes(absolutePositionFill, flexCenterChild)}>
          <CircularProgress size={20} />
        </div>
      ) : null}
    </div>
  );

  return (
    <Button {...restProps} disabled={isDisabled}>
      {contents}
    </Button>
  );
}
