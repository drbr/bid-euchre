import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { PropsWithChildren } from 'react';
import FlexView from 'react-flexview/lib';
import { Position } from '../../gameLogic/apiContract/database/Position';

/** Zero-width space character */
export const PLACEHOLDER = '\u200b';

export type PlayerAreaProps = {
  position: Position;
  playerName: string | null;
  awaited: boolean;
};

const PLAYER_AREA_HEIGHT_PX = 150;

export function PlayerAreaWhiteBackground(
  props: PropsWithChildren<PlayerAreaProps>
) {
  const { playerName, awaited, children } = props;

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
          {playerName || PLACEHOLDER}
        </Typography>
        <FlexView grow vAlignContent="center" hAlignContent="center">
          <PlayerCardUserContent>{children}</PlayerCardUserContent>
        </FlexView>
      </FlexView>
    </Paper>
  );
}

export function PlayerAreaNoBackground(
  props: PropsWithChildren<PlayerAreaProps>
) {
  const { playerName, awaited, children } = props;

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
        {playerName || PLACEHOLDER}
      </Typography>
      <FlexView
        grow
        vAlignContent="center"
        hAlignContent="center"
        marginTop={4}
      >
        <PlayerCardUserContent>{children}</PlayerCardUserContent>
      </FlexView>
    </FlexView>
  );
}

function PlayerCardUserContent(props: PropsWithChildren<unknown>): JSX.Element {
  return typeof props.children === 'string' ? (
    <Typography variant="h4" align="center">
      {props.children}
    </Typography>
  ) : (
    <>{props.children}</>
  );
}
