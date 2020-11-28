import _ from 'lodash';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import FlexView from 'react-flexview/lib';
import { useState } from 'react';
import { PublicGameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { GameLayout } from '../gameScreens/GameLayout';
import { joinGame } from '../firebase/CloudFunctionsClient';
import {
  PlayerInfoStorage,
  storePlayerInfoForGame,
} from '../uiHelpers/LocalStorageClient';
import { UIActions } from '../uiHelpers/UIActions';

export type JoinGameProps = {
  gameId: string;
  gameConfig: PublicGameConfig;
  setPlayerInfoFromStorage: (x: PlayerInfoStorage) => void;
  seatedAt: Position | null;
};

export function JoinGame(props: JoinGameProps) {
  const [playerName, setPlayerName] = useState('');

  function canTakeAnySeat() {
    return (
      !props.seatedAt &&
      isNameValid(playerName, props.gameConfig.playerFriendlyNames)
    );
  }

  const promptMessage = props.seatedAt
    ? 'Waiting for others to join the game…'
    : 'Enter your name and join at any open position.';

  return (
    <GameLayout
      seatedAt="south"
      renderPlayerElement={(position) => (
        <JoinButton
          playerNameAtPosition={props.gameConfig.playerFriendlyNames[position]}
          canJoin={canTakeAnySeat()}
          seatedHere={props.seatedAt === position}
          joinGame={() =>
            joinGameAtPosition({
              position,
              playerName,
              gameId: props.gameId,
              setPlayerInfoFromStorage: props.setPlayerInfoFromStorage,
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
        <Typography
          variant={props.seatedHere ? 'h6' : 'body1'}
          // fontWeight={props.seatedHere ? 'bold' : undefined}
        >
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

async function joinGameAtPosition(args: {
  gameId: string;
  playerName: string;
  position: Position;
  setPlayerInfoFromStorage: (x: PlayerInfoStorage) => void;
}) {
  const { playerName, position, gameId, setPlayerInfoFromStorage } = args;
  try {
    const joinGameResult = await joinGame({
      friendlyName: playerName,
      gameId: gameId,
      position: position,
    });

    storePlayerInfoForGame(joinGameResult);
    setPlayerInfoFromStorage(joinGameResult);
  } catch (e) {
    UIActions.showErrorAlert(e, {
      message: 'Could not join game. See log for details.',
    });
  }
}

function isNameValid(
  name: string,
  playerFriendlyNames: PublicGameConfig['playerFriendlyNames']
): boolean {
  if (name === '') {
    return false;
  }
  return _.every(playerFriendlyNames, (v) => v !== name);
}
