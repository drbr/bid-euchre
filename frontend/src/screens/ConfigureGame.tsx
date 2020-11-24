import _ from 'lodash';
import { useState } from 'react';
import FlexView from 'react-flexview/lib';
import { PublicGameConfig } from '../../../functions/apiContract/database/DataModel';
import { Position } from '../../../functions/apiContract/database/GameState';
import { joinGame } from '../firebase/CloudFunctionsClient';
import { PositionFriendlyNames } from '../uiHelpers/DisplayNames';

export type ConfigureGameProps = PublicGameConfig & { gameId: string };

export function ConfigureGame(props: ConfigureGameProps) {
  const [playerName, setPlayerName] = useState('');

  function joinGameAtPosition(position: Position) {
    void joinGame({
      friendlyName: playerName,
      gameId: props.gameId,
      position: position,
    });
  }

  function canJoinAtPosition(position: Position) {
    return (
      isNameValid(playerName, props.playerFriendlyNames) &&
      playerName !== props.playerFriendlyNames[position]
    );
  }

  return (
    <div>
      <p>{JSON.stringify(props, null, 2)}</p>

      {areSpotsAvailable(props.playerFriendlyNames) ? (
        <div>
          <label>Enter your name and join at an open position:</label>
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>
      ) : null}

      <FlexView column>
        <JoinButton
          position="north"
          config={props}
          enabled={canJoinAtPosition('north')}
          joinGame={joinGameAtPosition}
        />
        <JoinButton
          position="south"
          config={props}
          enabled={canJoinAtPosition('south')}
          joinGame={joinGameAtPosition}
        />
        <JoinButton
          position="east"
          config={props}
          enabled={canJoinAtPosition('east')}
          joinGame={joinGameAtPosition}
        />
        <JoinButton
          position="west"
          config={props}
          enabled={canJoinAtPosition('west')}
          joinGame={joinGameAtPosition}
        />
      </FlexView>
    </div>
  );
}

function JoinButton(props: {
  position: Position;
  config: PublicGameConfig;
  enabled: boolean;
  joinGame: (position: Position) => void;
}) {
  const playerFriendlyNames = props.config.playerFriendlyNames || {};
  const playerNameAtPosition = playerFriendlyNames[props.position];
  const positionName = PositionFriendlyNames[props.position];

  if (playerNameAtPosition) {
    return (
      <div>
        {positionName}: {playerNameAtPosition}
      </div>
    );
  } else {
    return (
      <button
        disabled={!props.enabled}
        onClick={() => props.joinGame(props.position)}
      >
        {positionName}
      </button>
    );
  }
}

function isNameValid(
  name: string,
  playerFriendlyNames: Record<Position, string>
): boolean {
  if (name === '') {
    return false;
  }
  return _.every(playerFriendlyNames, (v) => v !== name);
}

function areSpotsAvailable(
  playerFriendlyNames: Record<Position, string>
): boolean {
  return !_.every(playerFriendlyNames);
}
