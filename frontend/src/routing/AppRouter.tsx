import { Router, RouteComponentProps } from '@reach/router';
import { Lobby } from '../screens/Lobby';
import { Game } from '../screens/Game';
import { GamePathRouteProps, LobbyPath } from './paths';

export function AppRouter() {
  return (
    <Router>
      <LobbyRoute path={LobbyPath} />
      <GameRoute path="game/:gameId" />
    </Router>
  );
}

function LobbyRoute(props: RouteComponentProps) {
  return <Lobby />;
}

function GameRoute(props: RouteComponentProps & GamePathRouteProps) {
  if (!props.gameId) {
    return <div>No Game ID specified!</div>;
  } else {
    return <Game gameId={props.gameId} />;
  }
}
