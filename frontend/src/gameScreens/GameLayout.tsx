import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import { Position } from '../../../functions/apiContract/database/GameState';
import { cssClass } from '../style/styleFunctions';


export type GameLayoutProps = {
  seatedAt: Position | null;
  awaitedPosition?: Position;
  renderPlayerElement: (
    position: Position,
    awaited: boolean
  ) => React.ReactNode;
  tableCenterElement: React.ReactNode;
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
      <Card>
        <Box bgcolor={awaited ? '#ea78157a' : undefined}>
          <CardContent>
            {props.renderPlayerElement(position, awaited)}
          </CardContent>
        </Box>
      </Card>
    );
  }

  return (
    <Container maxWidth="md">
      <div className={GameLayoutClass}>
        <Grid container spacing={2}>
          {/* top row */}
          <Spacer />
          <Player>{renderPlayerAtIndex(0)}</Player>
          <Spacer />

          {/* middle row */}
          <Player>{renderPlayerAtIndex(1)}</Player>
          <Hidden xsDown>
            <Center>{props.tableCenterElement}</Center>
          </Hidden>
          <Player>{renderPlayerAtIndex(2)}</Player>

          {/* bottom row */}
          <Spacer />
          <Player>{renderPlayerAtIndex(3)}</Player>
          <Spacer />

          {/* on xs devices, display the center below the grid */}
          <Hidden smUp>
            <Grid item xs={12}>
              {props.tableCenterElement}
            </Grid>
          </Hidden>
        </Grid>
      </div>
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

const GameLayoutClass = cssClass('GameLayout', {
  textAlign: 'left',
});
