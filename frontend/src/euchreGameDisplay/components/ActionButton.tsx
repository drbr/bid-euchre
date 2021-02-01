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
  const actionButtonProps = useButtonPropsForActionButton(props);
  return <Button {...props} {...actionButtonProps} />;
}

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
  return <IconButton size="small" {...props} />;
}
