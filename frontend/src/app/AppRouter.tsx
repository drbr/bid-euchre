import { RouteComponentProps, Router } from '@reach/router';
import { Experiment } from '../experiment/Experiment';
import { ExperimentStateMachine } from '../experiment/ExperimentStateMachine';
import { GameStateMachine } from '../gameLogic/euchreStateMachine/GameStateMachine';
import { TransitionTestStateMachine } from '../test/TransitionTestStateMachine';
import { XStateViz, XStateVizProps } from '../XStateViz';
import { App } from './App';
import { GameContainer } from './GameContainer';
import { Lobby } from './Lobby';
import { GamePathRouteProps } from './paths';
import { createBufferStateMachine } from '../playGame/BufferMachine';
import { LocalGameContainer } from '../playGame/LocalGame';
import { GameContainerMachine } from './GameContainerMachine';

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

      <LocalGameRoute path="/localGame" />

      <StateMachineRoute
        path="/bufferMachine"
        machine={createBufferStateMachine()}
      />

      <StateMachineRoute
        path="/gameContainerMachine"
        machine={GameContainerMachine}
      />

      <StateMachineRoute
        path="/transitionTestStateMachine"
        machine={TransitionTestStateMachine}
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
    // Mount a fresh component any time the Game ID changes. This will ensure a fresh state buffer
    // is initialized when we switch from one game to another.
    return (
      <App>
        <GameContainer key={props.gameId} gameId={props.gameId} />
      </App>
    );
  }
}

function StateMachineRoute(props: RouteComponentProps & XStateVizProps) {
  return (
    <XStateViz
      machine={props.machine}
      childrenWithMachine={props.childrenWithMachine}
    />
  );
}

function ExperimentRoute(props: RouteComponentProps) {
  return <Experiment />;
}

function LocalGameRoute(props: RouteComponentProps) {
  return (
    <App>
      <LocalGameContainer />
    </App>
  );
}
