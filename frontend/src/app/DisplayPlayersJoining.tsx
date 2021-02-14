import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import _ from 'lodash';
import { Dispatch, useLayoutEffect, useRef, useState } from 'react';
import FlexView from 'react-flexview/lib';
import { ActionButton } from '../euchreGameDisplay/components/ActionButton';
import { GameLayout } from '../euchreGameDisplay/components/GameLayout';
import { GameConfig } from '../gameLogic/apiContract/database/DataModel';
import { Position } from '../gameLogic/apiContract/database/Position';

const MAX_NAME_LENGTH = 12;

export type DisplayPlayersJoiningProps = {
  gameId: string;
  gameConfig: GameConfig;
  joinGameAtPosition: Dispatch<{ playerName: string; position: Position }>;
  joinInProgress: boolean;
  seatedAt: Position | null;
};

export function DisplayPlayersJoining(props: DisplayPlayersJoiningProps) {
  const textFieldRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    textFieldRef.current?.focus();
  }, []);

  const playerNames = props.gameConfig.playerFriendlyNames;

  const [playerName, setPlayerName] = useState('');

  const helperText = nameInvalidHelperText(playerName, playerNames);
  const nameCanBeUsed = playerName !== '' && !helperText;

  function canTakeAnySeat() {
    return !props.seatedAt && nameCanBeUsed;
  }

  const promptMessage = props.seatedAt
    ? 'Waiting for others to join the game…'
    : 'Enter your name below, and then join at any open position above.';

  return (
    <div style={{ width: '100%' }}>
      <p>
        Copy the URL of this page and send it to your friends to let them join!
      </p>
      <GameLayout
        colorMode="light"
        playerFriendlyNames={playerNames}
        playersSittingOut={[]}
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
                  inputRef={textFieldRef}
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
    </div>
  );
}

function JoinButton(props: {
  playerNameAtPosition: string | null;
  canJoin: boolean;
  joinInProgress: boolean;
  joinGame: () => void;
}) {
  return props.playerNameAtPosition ? null : (
    <FlexView height="100%" vAlignContent="center" hAlignContent="center">
      <ActionButton
        size="large"
        variant="contained"
        color="primary"
        actionValid={props.canJoin}
        actionInProgress={props.joinInProgress}
        sendEvent={props.joinGame}
      >
        Join
      </ActionButton>
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
    _.some(
      playerFriendlyNames,
      (v) => v?.toLowerCase().trim() === name.toLowerCase().trim()
    )
  ) {
    return 'Another player has already joined with that name.';
  }
  return undefined;
}
