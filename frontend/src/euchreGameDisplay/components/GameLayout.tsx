import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Hand, Suit } from '../../gameLogic/Cards';
import { Position } from '../../gameLogic/apiContract/database/Position';
import { HandDisplay } from './HandDisplay';
import { Partnership } from '../../gameLogic/EuchreTypes';
import { SuitDisplayInfo } from './SuitDisplayInfo';

export type GameLayoutProps = {
  playerFriendlyNames: Record<Position, string | null>;
  score: Record<Partnership, number> | null;
  trumpSuit: Suit | undefined;
  seatedAt: Position | null;
  awaitedPosition?: Position;
  renderPlayerCardContent: (position: Position) => React.ReactNode;
  hands?: Record<Position, Hand>;
  promptMessage?: string;
  userActionControls?: React.ReactNode;
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

/**
 * Partnerships corresponding to [we, they] when viewed from the keyed position.
 */
const partnershipsByViewpoint: Record<Position, ReadonlyArray<Partnership>> = {
  north: ['northsouth', 'eastwest'],
  south: ['northsouth', 'eastwest'],
  east: ['eastwest', 'northsouth'],
  west: ['eastwest', 'northsouth'],
};

export function GameLayout(props: GameLayoutProps) {
  // Spectators view the game from South
  const positionsInOrder = positionsByViewpoint[props.seatedAt || 'south'];
  const partnershipsInOrder =
    partnershipsByViewpoint[props.seatedAt || 'south'];

  function playerCardAtIndex(i: number) {
    const position = positionsInOrder[i];
    const playerName = props.playerFriendlyNames[position];
    const awaited = props.awaitedPosition
      ? props.awaitedPosition === position
      : false;

    return (
      <Paper>
        <Box
          bgcolor={awaited ? '#ea78157a' : undefined}
          height={100}
          p={1}
          display="flex"
          flexDirection="column"
        >
          <Typography variant="h6" align="center" noWrap>
            {playerName || PLACEHOLDER}
          </Typography>
          <Box
            flex={1}
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Typography variant="h4" align="center">
              {PLACEHOLDER}
              {props.renderPlayerCardContent(position)}
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }

  return (
    <Container maxWidth="md">
      <Box mt={3} textAlign="left">
        <Grid container spacing={2} alignItems="center">
          {/* top row */}
          <Spacer>
            {props.score ? (
              <ScoreSingle
                playerFriendlyNames={props.playerFriendlyNames}
                score={props.score}
                partnership={partnershipsInOrder[0]}
                partnershipName={props.seatedAt ? 'We' : null}
              />
            ) : null}
          </Spacer>
          <Player>{playerCardAtIndex(0)}</Player>
          <Spacer>
            {props.score ? (
              <ScoreSingle
                playerFriendlyNames={props.playerFriendlyNames}
                score={props.score}
                partnership={partnershipsInOrder[1]}
                partnershipName={props.seatedAt ? 'They' : null}
              />
            ) : null}
          </Spacer>

          {/* middle row */}
          <Player>{playerCardAtIndex(1)}</Player>
          <Hidden xsDown>
            <Spacer />
            {/* <Center>
              <PromptInGrid message={props.promptMessage} />
            </Center> */}
          </Hidden>
          <Player>{playerCardAtIndex(2)}</Player>

          {/* bottom row */}
          <Spacer />
          <Player>{playerCardAtIndex(3)}</Player>
          <Spacer>
            {props.trumpSuit ? <Trump suit={props.trumpSuit} /> : null}
          </Spacer>
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

      {props.seatedAt && props.userActionControls ? (
        <Box mt={2}>{props.userActionControls}</Box>
      ) : null}

      {process.env.NODE_ENV === 'development' && props.debugControls
        ? props.debugControls
        : null}
    </Container>
  );
}

function Spacer(props: React.PropsWithChildren<unknown>) {
  return (
    <Grid item xs={3} sm={4}>
      {props.children}
    </Grid>
  );
}

function Player(props: React.PropsWithChildren<unknown>) {
  return (
    <Grid item xs={6} sm={4}>
      {props.children}
    </Grid>
  );
}

function ScoreSingle(props: {
  playerFriendlyNames: GameLayoutProps['playerFriendlyNames'];
  score: NonNullable<GameLayoutProps['score']>;
  partnership: Partnership;
  partnershipName: string | null;
}) {
  const positionA = props.partnership === 'northsouth' ? 'north' : 'east';
  const positionB = props.partnership === 'northsouth' ? 'south' : 'west';
  const teamName = props.partnershipName ?? (
    <>
      {props.playerFriendlyNames[positionA]}
      <br />
      {props.playerFriendlyNames[positionB]}
    </>
  );
  const teamScore = props.score[props.partnership];

  return (
    <Box textAlign="center">
      <Box marginBottom={0.5}>
        <Typography noWrap>{teamName}</Typography>
      </Box>
      <Typography variant="h5">{teamScore}</Typography>
    </Box>
  );
}

function Trump(props: { suit: Suit }) {
  const suitInfo = SuitDisplayInfo[props.suit];
  return (
    <Box textAlign="center">
      <Typography style={{ color: suitInfo.color }}>TRUMP</Typography>
      <Typography
        style={{
          fontSize: 60,
          color: suitInfo.color,
          marginTop: -20,
          marginBottom: -24,
        }}
      >
        {suitInfo.text}
      </Typography>
    </Box>
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
