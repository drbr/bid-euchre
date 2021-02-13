import * as _ from 'lodash';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Position } from '../../gameLogic/apiContract/database/Position';
import { Suit } from '../../gameLogic/Cards';
import { Partnership } from '../../gameLogic/EuchreTypes';
import { HandDisplayProps, HandDisplayStaticProps } from './HandDisplay';
import { SuitDisplayInfo } from './SuitDisplayInfo';
import {
  PLACEHOLDER,
  PlayerAreaNoBackground,
  PlayerAreaWhiteBackground,
} from './PlayerArea';

export type GameLayoutProps = {
  colorMode: 'dark' | 'light';
  playerFriendlyNames: Record<Position, string | null>;
  playersSittingOut: ReadonlyArray<Position>;
  score: Record<Partnership, number> | null;
  trumpSuit: Suit | undefined;
  trickCount: Record<Position, number> | undefined;
  seatedAt: Position | null;
  awaitedPosition?: Position;
  renderPlayerCardContent: (position: Position) => React.ReactNode;
  handsElement: React.ReactElement<
    HandDisplayProps | HandDisplayStaticProps
  > | null;
  promptMessage?: React.ReactNode | string;
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

    const cardContent = props.renderPlayerCardContent(position);
    const CardComponent =
      props.colorMode === 'dark'
        ? PlayerAreaNoBackground
        : PlayerAreaWhiteBackground;

    return (
      <CardComponent
        position={position}
        playerName={playerName}
        sittingOut={_.includes(props.playersSittingOut, position)}
        awaited={awaited}
        trickCount={props.trickCount}
      >
        {cardContent}
      </CardComponent>
    );
  }

  return (
    <Container maxWidth="md">
      <Box mt={3} textAlign="left">
        <Grid container spacing={1} alignItems="center">
          {/* top row */}
          <Spacer34>
            {props.score ? (
              <ScoreSingle
                colorMode={props.colorMode}
                playerFriendlyNames={props.playerFriendlyNames}
                score={props.score}
                partnership={partnershipsInOrder[0]}
                partnershipName={props.seatedAt ? 'We' : null}
              />
            ) : null}
          </Spacer34>
          <Player>{playerCardAtIndex(0)}</Player>
          <Spacer34>
            {props.score ? (
              <ScoreSingle
                colorMode={props.colorMode}
                playerFriendlyNames={props.playerFriendlyNames}
                score={props.score}
                partnership={partnershipsInOrder[1]}
                partnershipName={props.seatedAt ? 'They' : null}
              />
            ) : null}
          </Spacer34>

          {/* middle row */}
          <Hidden xsDown>
            <Spacer22 />
          </Hidden>
          <Player>{playerCardAtIndex(1)}</Player>
          <Player>{playerCardAtIndex(2)}</Player>
          <Hidden xsDown>
            <Spacer22 />
          </Hidden>

          {/* bottom row */}
          <Spacer34 />
          <Player>{playerCardAtIndex(3)}</Player>
          <Spacer34>
            {props.trumpSuit ? (
              <Trump suit={props.trumpSuit} colorMode={props.colorMode} />
            ) : null}
          </Spacer34>
        </Grid>
      </Box>

      <Box mt={2} pt={1} borderTop="1px solid">
        {props.handsElement}
      </Box>

      {props.promptMessage ? (
        <Box mt={3}>
          <PromptElement>{props.promptMessage}</PromptElement>
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

function Spacer34(props: React.PropsWithChildren<unknown>) {
  return (
    <Grid item xs={3} sm={4} style={{ textAlign: 'center' }}>
      {props.children}
    </Grid>
  );
}

function Spacer22(props: React.PropsWithChildren<unknown>) {
  return (
    <Grid item xs={2} sm={2} style={{ textAlign: 'center' }}>
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

const SCORE_WIDTH_PX = 60;

function ScoreSingle(props: {
  colorMode: GameLayoutProps['colorMode'];
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

  const scoreContent = (
    <Box textAlign="center" padding={1}>
      <Box marginBottom={0.5}>
        <Typography noWrap>{teamName}</Typography>
      </Box>
      <Typography variant="h5">{teamScore}</Typography>
    </Box>
  );

  if (props.colorMode === 'dark') {
    return (
      <Box display="inline-block" width={SCORE_WIDTH_PX}>
        <Paper style={{ backgroundColor: '#ffffffb0' }}>{scoreContent}</Paper>
      </Box>
    );
  } else {
    return scoreContent;
  }
}

function Trump(props: { suit: Suit; colorMode: GameLayoutProps['colorMode'] }) {
  const suitInfo = SuitDisplayInfo[props.suit];
  const trumpContent = (
    <Box textAlign="center" p={1} pb={2}>
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

  return (
    <Box display="inline-block">
      <Paper style={{ backgroundColor: '#ffffffb0' }}>{trumpContent}</Paper>
    </Box>
  );
}

function PromptElement(props: { children?: React.ReactNode }) {
  const childrenOrSpacer = props.children ?? PLACEHOLDER;
  if (typeof childrenOrSpacer === 'string') {
    return <PromptText>{childrenOrSpacer}</PromptText>;
  } else {
    return <>{childrenOrSpacer}</>;
  }
}

export function PromptText(props: { children?: string }) {
  return (
    <Typography variant="body1" align="center">
      {props.children}
    </Typography>
  );
}
