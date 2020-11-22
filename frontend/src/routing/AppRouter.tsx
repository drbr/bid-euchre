import { Router, RouteComponentProps } from '@reach/router';
import { Lobby } from '../screens/Lobby';
import { Game } from '../screens/GameContainer';
import { GamePathRouteProps } from './paths';

export function AppRouter() {
  return (
    <Router>
      <LobbyRoute path="/" />
      <LobbyRoute path="/game/" />
      <GameRoute path="/game/:gameId" />
      <LobbyRoute default />
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
