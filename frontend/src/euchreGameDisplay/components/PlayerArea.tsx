import Paper from '@material-ui/core/Paper';
import { useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { PropsWithChildren } from 'react';
import FlexView from 'react-flexview/lib';
import { Position } from '../../gameLogic/apiContract/database/Position';
import { absolutePositionFill } from '../../style/LayoutStyles';

/** Zero-width space character */
export const PLACEHOLDER = '\u200b';

export type PlayerAreaProps = {
  position: Position;
  playerName: string | null;
  sittingOut: boolean;
  awaited: boolean;
  trickCount?: Record<Position, number>;
};

const PLAYER_AREA_HEIGHT_PX_SMALL = 130;
const PLAYER_AREA_HEIGHT_PX_LARGE = 150;

const PLAYER_SITTING_OUT_TEXT_DECORATION = 'line-through .2em';

export function PlayerAreaWhiteBackground(
  props: PropsWithChildren<PlayerAreaProps>
) {
  const { awaited, children } = props;
  const playerName = getPlayerNameWithTrickCount(props);
  const isSmall = useIsSmallestSize();

  return (
    <Paper>
      <FlexView
        column
        style={{
          backgroundColor: awaited ? '#ea78157a' : undefined,
          padding: 4,
        }}
        height={
          isSmall ? PLAYER_AREA_HEIGHT_PX_SMALL : PLAYER_AREA_HEIGHT_PX_LARGE
        }
      >
        {/*
         * Player name should be defined everywhere except the Join UI. In the Join UI, let the
         * content (the join button) take all the vertical space.
         */}
        {playerName ? (
          <Typography
            component="div"
            align="center"
            noWrap
            style={{
              flexShrink: 0,
              textDecoration: props.sittingOut
                ? PLAYER_SITTING_OUT_TEXT_DECORATION
                : undefined,
            }}
          >
            {playerName}
          </Typography>
        ) : null}
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
  const playerName = getPlayerNameWithTrickCount(props);
  const isSmall = useIsSmallestSize();

  return (
    <FlexView
      column
      height={
        isSmall ? PLAYER_AREA_HEIGHT_PX_SMALL : PLAYER_AREA_HEIGHT_PX_LARGE
      }
      style={{
        padding: 4,
        borderRadius: 4,
        backgroundColor: awaited ? '#ea78157a' : undefined,
      }}
    >
      <Typography
        component="div"
        align="center"
        noWrap
        style={{
          flexShrink: 0,
          textDecoration: props.sittingOut
            ? PLAYER_SITTING_OUT_TEXT_DECORATION
            : undefined,
        }}
      >
        {playerName}
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

  return nameWithTricks;
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

function useIsSmallestSize() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('xs'));
  return isXs;
}
