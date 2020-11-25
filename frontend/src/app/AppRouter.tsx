import { RouteComponentProps, Router } from '@reach/router';
import { XStateViz } from '../XStateViz';
import { GameContainer } from '../screens/GameContainer';
import { Lobby } from '../screens/Lobby';
import { App } from './App';
import { GamePathRouteProps } from './paths';
import { GameStateMachine } from '../gameLogic/stateMachine/GameStateMachine';

export function AppRouter() {
  return (
    <Router>
      <LobbyRoute path="/" />
      <LobbyRoute path="/game/" />
      <GameRoute path="/game/:gameId" />
      <LobbyRoute default />
      <StateMachineRoute path="/stateMachine" />
    </Router>
  );
}

function LobbyRoute(props: RouteComponentProps) {
  return (
    <App>
      <Lobby />
    </App>
  );
}

function GameRoute(props: RouteComponentProps & GamePathRouteProps) {
  if (!props.gameId) {
    return <div>No Game ID specified!</div>;
  } else {
    // Mount a fresh component any time the Game ID changes
    return (
      <App>
        <GameContainer key={props.gameId} gameId={props.gameId} />
      </App>
    );
  }
}

function StateMachineRoute(props: RouteComponentProps) {
  return <XStateViz machine={GameStateMachine} />;
}
