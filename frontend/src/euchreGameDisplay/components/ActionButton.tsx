import * as _ from 'lodash';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { ComponentPropsWithoutRef, PropsWithChildren } from 'react';
import {
  ActionButtonDomainProps,
  useButtonPropsForActionButton,
} from './ActionButtonProps';

export type ButtonProps = ComponentPropsWithoutRef<typeof Button>;
export type IconButtonProps = ComponentPropsWithoutRef<typeof IconButton>;

/**
 * A Material UI button that supports displaying a CircularProgress spinner when in the loading
 * state. Use this for buttons with text content, which should be passed in via the `children` prop.
 *
 * This takes in the ActionButtonDomainProps and converts them to raw button props, and will
 * wrap/overwrite the `children`, `onClick`, and `disabled` props if they were provided.
 */
export function ActionButton(props: ButtonProps & ActionButtonDomainProps) {
  // Remove the props that the MUI Button widget doesn't recognize
  const buttonProps = _.omit(props, Object.keys(ActionButtonDomainPropNames));

  const actionButtonProps = useButtonPropsForActionButton(props);
  return <Button {...buttonProps} {...actionButtonProps} />;
}

const ActionButtonDomainPropNames: {
  [K in keyof ActionButtonDomainProps]: K;
} = {
  actionInProgress: 'actionInProgress',
  actionValid: 'actionValid',
  sendEvent: 'sendEvent',
};

/**
 * A special version of the ActionButton, formatted for displaying a card icon. The icon should be
 * passed in via the `children` prop.
 */
export function CardActionButton(
  props: PropsWithChildren<ActionButtonDomainProps>
) {
  const actionButtonProps = useButtonPropsForActionButton(props);
  return (
    <IconButtonForCard
      {...actionButtonProps}
      style={{
        opacity: actionButtonProps.disabled ? 0.5 : undefined,
      }}
    >
      {props.children}
    </IconButtonForCard>
  );
}

export function NonInteractiveCard(props: PropsWithChildren<unknown>) {
  return (
    <IconButtonForCard disabled={true}>{props.children}</IconButtonForCard>
  );
}

/**
 * The underlying Material UI component that renders the card button. We've extracted it out to keep
 * the style as similar as possible between non-interactive cards and card buttons.
 */
function IconButtonForCard(props: IconButtonProps) {
  // The MUI icon button has "border-radius: 50%", which seems to be ignored in Chrome/Firefox but
  // obeyed in Safari, which cuts off the corners of the cards and makes it look awful. Manually set
  // it to 0 so it looks okay in Safari.
  const buttonStyles: React.CSSProperties = {
    ...props.style,
    borderRadius: 0,
  };
  return <IconButton size="small" {...props} style={buttonStyles} />;
}
