import _ from 'lodash';
import { useState } from 'react';
import FlexView from 'react-flexview';
import {
  PlayerFriendlyNames,
  PublicGameConfig,
} from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { GameLayout } from './GameLayout';

export type JoinGameProps = PublicGameConfig & {
  gameId: string;
  joinGameAtPosition: (args: {
    playerName: string;
    position: Position;
  }) => void;
  seatedAt?: Position;
};

export function JoinGame(props: JoinGameProps) {
  const [playerName, setPlayerName] = useState('');

  function canTakeSeat() {
    return (
      !props.seatedAt && isNameValid(playerName, props.playerFriendlyNames)
    );
  }

  return (
    <div>
      <p>{JSON.stringify(props, null, 2)}</p>

      <GameLayout
        viewpoint="south"
        renderPlayerElement={(position) => (
          <JoinButton
            playerNameAtPosition={props.playerFriendlyNames[position]}
            canJoin={canTakeSeat()}
            seatedHere={props.seatedAt === position}
            joinGame={() => props.joinGameAtPosition({ position, playerName })}
          />
        )}
        tableCenterElement={
          props.seatedAt ? (
            <div>Waiting for others to join the game…</div>
          ) : (
            <div>
              <label>Enter your name and join at an open position:</label>
              <input
                autoFocus
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>
          )
        }
      />
    </div>
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
        <button disabled={!props.canJoin} onClick={() => props.joinGame()}>
          Join
        </button>
      )}
    </FlexView>
  );
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
