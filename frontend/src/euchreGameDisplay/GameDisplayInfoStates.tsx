import { Position } from '../gameLogic/apiContract/database/Position';
import {
  determineGameWinner,
  getSides,
} from '../gameLogic/euchreStateMachine/GameStateMachine';
import { Partnership } from '../gameLogic/EuchreTypes';
import { PositionsForPartnership } from '../gameLogic/utils/PositionHelpers';
import { GameLayout } from './components/GameLayout';
import { InfoStateOKButton } from './components/InfoStateOKButton';
import { GameDisplayProps } from './GameDisplayDelegator';

export function RoundCompleteInfo(props: GameDisplayProps): JSX.Element {
  const playerNames = props.gameConfig.playerFriendlyNames;
  const scoreDelta = props.stateContext.scoreDelta;
  const { offense, defense } = getSides(props.stateContext);

  if (!scoreDelta) {
    throw new Error('Cannot display score; scoreDelta is not in game context');
  }

  const offenseNames = getTeamNames(offense, playerNames);
  const offenseScore = scoreDelta[offense].delta;
  const offensePrompt = getTeamPrompt(offenseNames, offenseScore);

  const defenseNames = getTeamNames(defense, playerNames);
  const defenseScore = scoreDelta[defense].delta;
  const defensePrompt = getTeamPrompt(defenseNames, defenseScore);

  const bidWasMetPrompt = `${offenseNames} fulfilled their bid.`;
  const bidWasNotMetPrompt = `${offenseNames} did not fulfill their bid.`;
  const roundCompletePrompt = `Round complete. ${
    scoreDelta.bidWasMet ? bidWasMetPrompt : bidWasNotMetPrompt
  }`;

  const winner = determineGameWinner(props.stateContext);
  const winnerActionControls = winner ? (
    `${winner === offense ? offenseNames : defenseNames} won the game!`
  ) : (
    <InfoStateOKButton {...props} />
  );

  return (
    <GameLayout
      colorMode="dark"
      playerFriendlyNames={props.gameConfig.playerFriendlyNames}
      playersSittingOut={[]}
      score={props.stateContext.score}
      trumpSuit={undefined}
      trickCount={props.stateContext.trickCount}
      seatedAt={props.seatedAt}
      awaitedPosition={undefined}
      renderPlayerCardContent={() => null}
      promptMessage={
        <div>
          <p>{roundCompletePrompt}</p>
          <p>{offensePrompt}</p>
          <p>{defensePrompt}</p>
        </div>
      }
      handsElement={null}
      userActionControls={winnerActionControls}
    />
  );
}

function getTeamNames(
  team: Partnership,
  playerNames: Record<Position, string>
): string {
  const positions = PositionsForPartnership[team];
  const names = positions.map((pos) => playerNames[pos]).join('/');
  return names;
}

function getTeamPrompt(teamNames: string, teamScore: number) {
  return (
    <span>
      {teamNames}: <strong>{teamScore}</strong>
    </span>
  );
}
