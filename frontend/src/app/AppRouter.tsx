import { RouteComponentProps, Router } from '@reach/router';
import { XStateViz, XStateVizProps } from '../XStateViz';
import { GameContainer } from '../screens/GameContainer';
import { Lobby } from '../screens/Lobby';
import { App } from './App';
import { GamePathRouteProps } from './paths';
import { GameStateMachine } from '../gameLogic/stateMachine/GameStateMachine';
import { Experiment } from '../experiment/Experiment';
import { ExperimentStateMachine } from '../experiment/ExperimentStateMachine';

export function AppRouter() {
  return (
    <Router>
      <LobbyRoute path="/" />
      <LobbyRoute path="/game/" />
      <GameRoute path="/game/:gameId" />
      <LobbyRoute default />
      <StateMachineRoute path="/stateMachine" machine={GameStateMachine} />

      <ExperimentRoute path="/experiment" />
      <StateMachineRoute
        path="/experimentStateMachine"
        machine={ExperimentStateMachine}
      />
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

function StateMachineRoute(props: RouteComponentProps & XStateVizProps) {
  return <XStateViz machine={props.machine} />;
}

function ExperimentRoute(props: RouteComponentProps) {
  return <Experiment />;
}
