import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ComponentPropsWithoutRef, useEffect, useState } from 'react';
import { classes } from 'typestyle';
import { absolutePositionFill, flexCenterChild } from '../style/LayoutStyles';

export type ActionButtonProps = ComponentPropsWithoutRef<typeof Button> & {
  actionInProgress?: boolean;
};

type OnClickEvent = Parameters<Required<ActionButtonProps>['onClick']>[0];

/**
 * A Material UI button that supports displaying a CircularProgress spinner when in the loading
 * state
 */
export function ActionButton(props: ActionButtonProps) {
  const {
    children,
    actionInProgress,
    disabled: disabledProp,
    onClick: onClickProp,
    ...restProps
  } = props;

  // The parent component passes down the `loading` prop to indicate that an action is in progress.
  // However, because there may be multiple buttons on the screen, we want to show the loading
  // indicator only on the button that was actually clicked. We do that with this extra prop, which
  // assumes that clicking an action button is the sole way to invoke a game action.
  const [thisButtonWasClicked, setThisButtonWasClicked] = useState(false);
  useEffect(() => {
    if (!actionInProgress) {
      setThisButtonWasClicked(false);
    }
  }, [actionInProgress]);

  function customOnClick(event: OnClickEvent) {
    if (onClickProp) {
      setThisButtonWasClicked(true);
      onClickProp(event);
    }
  }

  // Since only one action can happen at a time, all buttons get disabled when any action is in
  // progress.
  const renderAsDisabled = disabledProp || actionInProgress;
  const renderAsLoading = thisButtonWasClicked && actionInProgress;

  const contents = (
    <div style={{ position: 'relative' }}>
      <span style={{ visibility: renderAsLoading ? 'hidden' : 'visible' }}>
        {children}
      </span>
      {renderAsLoading ? (
        <div className={classes(absolutePositionFill, flexCenterChild)}>
          <CircularProgress size={20} color="secondary" />
        </div>
      ) : null}
    </div>
  );

  return (
    <Button {...restProps} onClick={customOnClick} disabled={renderAsDisabled}>
      {contents}
    </Button>
  );
}
