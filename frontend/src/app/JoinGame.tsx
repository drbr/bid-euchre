import _ from 'lodash';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { useState } from 'react';
import FlexView from 'react-flexview';
import {
  PlayerFriendlyNames,
  PublicGameConfig,
} from '../../../functions/apiContract/database/DataModel';
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
      tableCenterElement={
        props.seatedAt ? (
          <div>Waiting for others to join the game…</div>
        ) : (
          <div>
            <label>Enter your name and join at an open position:</label>
            <TextField
              label="Name"
              variant="outlined"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>
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
    <FlexView vAlignContent="center" hAlignContent="center" height="100%">
      {props.playerNameAtPosition ? (
        <div style={{ fontWeight: props.seatedHere ? 'bold' : undefined }}>
          {props.playerNameAtPosition}
        </div>
      ) : (
        <Button
          variant="contained"
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
  playerFriendlyNames: PlayerFriendlyNames
): boolean {
  if (name === '') {
    return false;
  }
  return _.every(playerFriendlyNames, (v) => v !== name);
}
