import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { PropsWithChildren } from 'react';
import FlexView from 'react-flexview/lib';
import { Position } from '../../gameLogic/apiContract/database/Position';
import { absolutePositionFill } from '../../style/LayoutStyles';

/** Zero-width space character */
export const PLACEHOLDER = '\u200b';

export type PlayerAreaProps = {
  position: Position;
  playerName: string | null;
  awaited: boolean;
  trickCount?: Record<Position, number>;
};

const PLAYER_AREA_HEIGHT_PX = 130;

export function PlayerAreaWhiteBackground(
  props: PropsWithChildren<PlayerAreaProps>
) {
  const { awaited, children } = props;

  return (
    <Paper>
      <FlexView
        column
        style={{
          backgroundColor: awaited ? '#ea78157a' : undefined,
          padding: 4,
        }}
        height={PLAYER_AREA_HEIGHT_PX}
      >
        <Typography align="center" noWrap style={{ flexShrink: 0 }}>
          {getPlayerNameWithTrickCount(props)}
        </Typography>
        <FlexView
          grow
          style={{ position: 'relative' }}
          vAlignContent="center"
          hAlignContent="center"
        >
          <PlayerCardUserContent>{children}</PlayerCardUserContent>
        </FlexView>
      </FlexView>
    </Paper>
  );
}

export function PlayerAreaNoBackground(
  props: PropsWithChildren<PlayerAreaProps>
) {
  const { awaited, children } = props;

  return (
    <FlexView
      column
      height={PLAYER_AREA_HEIGHT_PX}
      style={{
        padding: 4,
        borderRadius: 4,
        backgroundColor: awaited ? '#ea78157a' : undefined,
      }}
    >
      <Typography align="center" noWrap style={{ flexShrink: 0 }}>
        {getPlayerNameWithTrickCount(props)}
      </Typography>
      <FlexView
        grow
        style={{ position: 'relative' }}
        vAlignContent="center"
        hAlignContent="center"
        marginTop={4}
      >
        <PlayerCardUserContent>{children}</PlayerCardUserContent>
      </FlexView>
    </FlexView>
  );
}

function getPlayerNameWithTrickCount(props: PlayerAreaProps) {
  const trickCount = props.trickCount ? props.trickCount[props.position] : 0;
  const nameWithTricks =
    trickCount > 0 ? (
      <FlexView hAlignContent="center">
        <span
          style={{
            display: 'inline-block',
            flexShrink: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {props.playerName}
        </span>
        <strong style={{ flexShrink: 0, marginLeft: 6 }}>({trickCount})</strong>
      </FlexView>
    ) : (
      props.playerName
    );

  return nameWithTricks || PLACEHOLDER;
}

function PlayerCardUserContent(props: PropsWithChildren<unknown>): JSX.Element {
  return typeof props.children === 'string' ? (
    <Typography variant="h4" align="center">
      {props.children}
    </Typography>
  ) : (
    <div className={absolutePositionFill} style={{ textAlign: 'center' }}>
      {props.children}
    </div>
  );
}
