import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import _ from 'lodash';
import { Dispatch, useState } from 'react';
import { GameLayout } from '../euchreGameDisplay/components/GameLayout';
import { GameConfig } from '../gameLogic/apiContract/database/DataModel';
import { Position } from '../gameLogic/apiContract/database/Position';
import { ActionButton } from '../euchreGameDisplay/components/ActionButton';

const MAX_NAME_LENGTH = 12;

export type DisplayPlayersJoiningProps = {
  gameId: string;
  gameConfig: GameConfig;
  joinGameAtPosition: Dispatch<{ playerName: string; position: Position }>;
  joinInProgress: boolean;
  seatedAt: Position | null;
};

export function DisplayPlayersJoining(props: DisplayPlayersJoiningProps) {
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
      colorMode="light"
      playerFriendlyNames={playerNames}
      score={null}
      trumpSuit={undefined}
      trickCount={undefined}
      seatedAt="south"
      awaitedPosition={props.seatedAt ?? undefined}
      renderPlayerCardContent={(position) => (
        <JoinButton
          playerNameAtPosition={playerNames[position]}
          canJoin={canTakeAnySeat()}
          joinInProgress={props.joinInProgress}
          joinGame={() => props.joinGameAtPosition({ position, playerName })}
        />
      )}
      handsElement={null}
      promptMessage={promptMessage}
      userActionControls={
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
  joinInProgress: boolean;
  joinGame: () => void;
}) {
  return props.playerNameAtPosition ? null : (
    <ActionButton
      fullWidth
      actionValid={props.canJoin}
      actionInProgress={props.joinInProgress}
      sendEvent={props.joinGame}
    >
      Join
    </ActionButton>
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
