import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import FlexView from 'react-flexview/lib';
import { Hand } from '../../../functions/apiContract/database/Cards';
import { Position } from '../../../functions/apiContract/database/GameState';

export type GameLayoutProps = {
  seatedAt: Position | null;
  awaitedPosition?: Position;
  renderPlayerElement: (position: Position) => React.ReactNode;
  promptMessage?: string;
  hand?: Hand;
  userActionElement?: React.ReactNode;
};

/**
 * Positions in their order on a grid layout when viewed from the keyed position.
 * This enables us to render the same game from the point of view of each player,
 * with their opponents in the same relative positions at the table.
 */
const positionsByViewpoint: Record<Position, ReadonlyArray<Position>> = {
  north: ['south', 'east', 'west', 'north'],
  south: ['north', 'west', 'east', 'south'],
  east: ['west', 'south', 'north', 'east'],
  west: ['east', 'north', 'south', 'west'],
};

export function GameLayout(props: GameLayoutProps) {
  // Spectators view the game from South
  const positionsInOrder = positionsByViewpoint[props.seatedAt || 'south'];

  function renderPlayerAtIndex(i: number) {
    const position = positionsInOrder[i];
    const awaited = props.awaitedPosition
      ? props.awaitedPosition === position
      : false;

    return (
      <Paper>
        <Box bgcolor={awaited ? '#ea78157a' : undefined}>
          {/* <CardContent>{props.renderPlayerElement(position)}</CardContent> */}
          <Box p={1}>{props.renderPlayerElement(position)}</Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Container maxWidth="sm" fixed>
      <Box mt={3} textAlign="left">
        <Grid container spacing={2} alignItems="center">
          {/* top row */}
          <Spacer />
          <Player>{renderPlayerAtIndex(0)}</Player>
          <Spacer />

          {/* middle row */}
          <Player>{renderPlayerAtIndex(1)}</Player>
          <Hidden xsDown>
            <Center>
              <PromptInGrid message={props.promptMessage} />
            </Center>
          </Hidden>
          <Player>{renderPlayerAtIndex(2)}</Player>

          {/* bottom row */}
          <Spacer />
          <Player>{renderPlayerAtIndex(3)}</Player>
          <Spacer />

          {/* on xs devices, display the center below the grid */}
          <Hidden smUp>
            <Grid item xs={12}>
              <PromptText message={props.promptMessage} />
            </Grid>
          </Hidden>
        </Grid>
      </Box>
      {props.hand ? <Box mt={3}>{JSON.stringify(props.hand)}</Box> : null}
      <Box mt={3}>{props.userActionElement ?? ''}</Box>
    </Container>
  );
}

function Spacer() {
  return <Grid item xs={3} sm={4} />;
}

function Player(props: React.PropsWithChildren<unknown>) {
  return (
    <Grid item xs={6} sm={4}>
      {props.children}
    </Grid>
  );
}

function Center(props: React.PropsWithChildren<unknown>) {
  return (
    <Grid item xs={12} sm={4}>
      {props.children}
    </Grid>
  );
}

function PromptInGrid(props: { message?: string }) {
  return (
    <Box>
      <FlexView vAlignContent="center" hAlignContent="center" height={100}>
        <PromptText message={props.message} />
      </FlexView>
    </Box>
  );
}

function PromptText(props: { message?: string }) {
  const messageOrSpacer = props.message ?? PLACEHOLDER;
  return (
    <Typography variant="body1" align="center">
      {messageOrSpacer}
    </Typography>
  );
}

export const PLACEHOLDER = '\u200b';
