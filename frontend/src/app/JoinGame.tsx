import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import _ from 'lodash';
import { useState } from 'react';
import FlexView from 'react-flexview/lib';
import { GameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { GameLayout } from '../gameScreens/GameLayout';
import { joinGameAndStorePlayerInfo } from '../routines/joinGameAndStorePlayerInfo';
import { PlayerInfoStorage } from '../uiHelpers/LocalStorageClient';

const MAX_NAME_LENGTH = 12;

export type JoinGameProps = {
  gameId: string;
  gameConfig: GameConfig;
  storePlayerInfo: (x: PlayerInfoStorage) => void;
  seatedAt: Position | null;
};

export function JoinGame(props: JoinGameProps) {
  const playerNames = props.gameConfig.playerFriendlyNames;

  const [playerName, setPlayerName] = useState('');

  const helperText = nameInvalidHelperText(playerName, playerNames);
  const nameCanBeUsed = playerName !== '' && !helperText;

  function canTakeAnySeat() {
    return !props.seatedAt && nameCanBeUsed;
  }

  const promptMessage = props.seatedAt
    ? 'Waiting for others to join the game…'
    : 'Enter your name and join at any open position.';

  return (
    <GameLayout
      seatedAt="south"
      awaitedPosition={props.seatedAt ?? undefined}
      renderPlayerElement={(position) => (
        <JoinButton
          playerNameAtPosition={playerNames[position]}
          canJoin={canTakeAnySeat()}
          seatedHere={props.seatedAt === position}
          joinGame={() =>
            joinGameAndStorePlayerInfo({
              position,
              playerName,
              gameId: props.gameId,
              storePlayerInfo: props.storePlayerInfo,
            })
          }
        />
      )}
      promptMessage={promptMessage}
      userActionElement={
        props.seatedAt ? null : (
          <Paper>
            <Box p={1} textAlign="center">
              <TextField
                label="Name"
                error={!!helperText}
                helperText={helperText}
                fullWidth
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </Box>
          </Paper>
        )
      }
    />
  );
}

function JoinButton(props: {
  playerNameAtPosition: string | null;
  canJoin: boolean;
  seatedHere: boolean;
  joinGame: () => void;
}) {
  return (
    <FlexView vAlignContent="center" hAlignContent="center" height={36}>
      {props.playerNameAtPosition ? (
        <Typography variant={props.seatedHere ? 'h6' : 'body1'}>
          {props.playerNameAtPosition}
        </Typography>
      ) : (
        <Button
          fullWidth
          disabled={!props.canJoin}
          onClick={() => props.joinGame()}
        >
          Join
        </Button>
      )}
    </FlexView>
  );
}

function nameInvalidHelperText(
  name: string,
  playerFriendlyNames: GameConfig['playerFriendlyNames']
): string | undefined {
  if (name.length > MAX_NAME_LENGTH) {
    return 'The name entered is too long.';
  }
  if (
    _.some(playerFriendlyNames, (v) => v?.toLowerCase() === name.toLowerCase())
  ) {
    return 'Another player has already joined with that name.';
  }
  return undefined;
}
