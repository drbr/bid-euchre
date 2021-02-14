import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { useNavigate } from '@reach/router';
import { GamePathLink } from '../app/paths';
import { Position } from '../gameLogic/apiContract/database/Position';
import {
  determineGameWinner,
  getSides,
} from '../gameLogic/euchreStateMachine/GameStateMachine';
import { Partnership } from '../gameLogic/EuchreTypes';
import { PositionsForPartnership } from '../gameLogic/utils/PositionHelpers';
import { GameLayout } from './components/GameLayout';
import { InfoStateManualProceedButton } from './components/InfoStateProceedButton';
import { GameDisplayProps } from './GameDisplayDelegator';

export function RoundCompleteInfo(props: GameDisplayProps): JSX.Element {
  const winner = determineGameWinner(props.stateContext);

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
      promptMessage={<RoundOrGameCompletePrompt {...props} />}
      handsElement={null}
      userActionControls={
        winner ? null : (
          <InfoStateManualProceedButton unblockHead={props.unblockHead} />
        )
      }
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

function RoundOrGameCompletePrompt(props: GameDisplayProps) {
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
  const winnerPrompt = winner
    ? `${winner === offense ? offenseNames : defenseNames} won the game!`
    : null;

  const nextGameID = props.stateContext.nextGameID;

  return (
    <>
      <Typography variant="body1" component="div" align="center">
        <p>{roundCompletePrompt}</p>
        <p>{offensePrompt}</p>
        <p>{defensePrompt}</p>
        {winnerPrompt ? <p>{winnerPrompt}</p> : null}
        {nextGameID ? <PlayAgainButton nextGameID={nextGameID} /> : null}
      </Typography>
    </>
  );
}

function PlayAgainButton(props: { nextGameID: string }): JSX.Element {
  const navigate = useNavigate();
  return (
    <Button
      variant="contained"
      onClick={() => navigate(GamePathLink({ gameId: props.nextGameID }))}
    >
      Play Again
    </Button>
  );
}
