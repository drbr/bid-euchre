import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Hand } from '../gameLogic/apiContract/database/Cards';
import { Position } from '../gameLogic/apiContract/database/GameState';
import { HandDisplay } from './HandDisplay';

export type GameLayoutProps = {
  seatedAt: Position | null;
  awaitedPosition?: Position;
  renderPlayerElement: (position: Position) => React.ReactNode;
  promptMessage?: string;
  hands?: Record<Position, Hand>;
  userActionElement?: React.ReactNode;
  debugControls?: React.ReactNode;
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
          <Box p={1}>{props.renderPlayerElement(position)}</Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box mt={3} textAlign="left">
        <Grid container spacing={2} alignItems="center">
          {/* top row */}
          <Spacer />
          <Player>{renderPlayerAtIndex(0)}</Player>
          <Spacer />

          {/* middle row */}
          <Player>{renderPlayerAtIndex(1)}</Player>
          <Hidden xsDown>
            <Spacer />
            {/* <Center>
              <PromptInGrid message={props.promptMessage} />
            </Center> */}
          </Hidden>
          <Player>{renderPlayerAtIndex(2)}</Player>

          {/* bottom row */}
          <Spacer />
          <Player>{renderPlayerAtIndex(3)}</Player>
          <Spacer />
        </Grid>
      </Box>

      {props.seatedAt && props.hands ? (
        <Box mt={3}>
          <HandDisplay hand={props.hands[props.seatedAt]} />
        </Box>
      ) : null}

      {props.promptMessage ? (
        <Box mt={3}>
          <PromptText message={props.promptMessage} />
        </Box>
      ) : null}

      {props.seatedAt && props.userActionElement ? (
        <Box mt={2}>{props.userActionElement}</Box>
      ) : null}

      {process.env.NODE_ENV === 'development' && props.debugControls
        ? props.debugControls
        : null}
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

// function Center(props: React.PropsWithChildren<unknown>) {
//   return (
//     <Grid item xs={12} sm={4}>
//       {props.children}
//     </Grid>
//   );
// }

// function PromptInGrid(props: { message?: string }) {
//   return (
//     <Box>
//       <FlexView vAlignContent="center" hAlignContent="center" height={100}>
//         <PromptText message={props.message} />
//       </FlexView>
//     </Box>
//   );
// }

function PromptText(props: { message?: string }) {
  const messageOrSpacer = props.message ?? PLACEHOLDER;
  return (
    <Typography variant="body1" align="center">
      {messageOrSpacer}
    </Typography>
  );
}

export const PLACEHOLDER = '\u200b';
