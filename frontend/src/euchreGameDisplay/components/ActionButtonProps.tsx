import ButtonBase from '@material-ui/core/ButtonBase';
import CircularProgress from '@material-ui/core/CircularProgress';
import {
  ComponentPropsWithoutRef,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { classes } from 'typestyle';
import { EventObject } from 'xstate';
import {
  ScopedGameDisplayProps,
  UnscopedGameDisplayProps,
} from '../GameDisplayProps';
import {
  absolutePositionFill,
  flexCenterChild,
} from '../../style/LayoutStyles';

type ButtonBaseProps = ComponentPropsWithoutRef<typeof ButtonBase>;

export type ActionButtonDomainProps = {
  actionValid: boolean;
  actionInProgress: boolean;
  sendEvent: () => void;
};

/**
 * Returns props for a Material UI button that correspond to our domain-specific requirements for
 * an action button. This is a hook, so it must be run from the main body of a function component.
 *
 * @param props The domain props, likely generated from `actionButtonPropsForGameEvent`.
 */
export function useButtonPropsForActionButton(
  props: PropsWithChildren<ActionButtonDomainProps>
): Pick<Required<ButtonBaseProps>, 'children' | 'onClick' | 'disabled'> {
  // The parent component passes down the `loading` prop to indicate that an action is in progress.
  // However, because there may be multiple buttons on the screen, we want to show the loading
  // indicator only on the button that was actually clicked. We do that with this extra prop, which
  // assumes that clicking an action button is the sole way to invoke a game action.
  const [thisButtonWasClicked, setThisButtonWasClicked] = useState(false);
  useEffect(() => {
    if (!props.actionInProgress) {
      setThisButtonWasClicked(false);
    }
  }, [props.actionInProgress]);

  function customOnClick() {
    if (props.sendEvent) {
      setThisButtonWasClicked(true);
      props.sendEvent();
    }
  }

  // Since only one action can happen at a time, all buttons get disabled when any action is in
  // progress.
  const renderAsDisabled = !props.actionValid || props.actionInProgress;
  const renderAsLoading = thisButtonWasClicked && props.actionInProgress;

  const contents = (
    <div style={{ position: 'relative' }}>
      <span style={{ visibility: renderAsLoading ? 'hidden' : 'visible' }}>
        {props.children}
      </span>
      {renderAsLoading ? (
        <div className={classes(absolutePositionFill, flexCenterChild)}>
          <CircularProgress size={20} color="secondary" />
        </div>
      ) : null}
    </div>
  );

  return {
    children: contents,
    onClick: customOnClick,
    disabled: renderAsDisabled,
  };
}

/**
 * The subset of the GameDisplayProps that are needed to bind to an action button.
 */
export type GameDisplayPropsForActionButton<E extends EventObject> = Pick<
  ScopedGameDisplayProps<unknown, E>,
  'isEventValid' | 'sendGameEvent'
> &
  Pick<UnscopedGameDisplayProps, 'bufferMachineMode'>;

/**
 * The most common use case of an action button is for sending a game event. This function returns
 * primitives for a specific game context and event, which can be passed into
 * `useButtonPropsForActionButton` to render an action button.
 */
export function actionButtonPropsForGameEvent<E extends EventObject>(
  event: E,
  gameDisplayProps: GameDisplayPropsForActionButton<E>
): ActionButtonDomainProps {
  return {
    actionInProgress:
      gameDisplayProps.bufferMachineMode.mode === 'sendingGameEvent',
    actionValid: gameDisplayProps.isEventValid(event),
    sendEvent: () => gameDisplayProps.sendGameEvent(event),
  };
}
