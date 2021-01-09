import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { ComponentPropsWithoutRef } from 'react';
import { absolutePositionFill } from '../style/LayoutStyles';

export type ActionButtonProps = ComponentPropsWithoutRef<typeof Button> & {
  loading?: boolean;
};

/**
 * A Material UI button with a `loading` prop, which, if true, displays a spinner instead of the
 * button text
 */
export function ActionButton(props: ActionButtonProps) {
  const { children, loading, ...restProps } = props;

  const contents = (
    <div style={{ position: 'relative' }}>
      <span style={{ visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </span>
      {loading ? (
        <div
          className={absolutePositionFill}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress size={20} />
        </div>
      ) : null}
    </div>
  );

  return <Button {...restProps}>{contents}</Button>;
}
