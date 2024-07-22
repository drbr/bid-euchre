# Bid Euchre App

This is an online multiplayer web application that allows four players to play [Bid
Euchre](https://www.euchre.space) online, inspired by such easy-to-use apps as
[downforacross](https://downforacross.com/) and [horsepaste](https://www.horsepaste.com/).

It supports desktop computers and touch devices such as tablets and phones. Supported browsers
include latest Chrome, latest Firefox, and Safari 13 or later.

# Implementation goals and stack

There do exist mature game engines that I could have used to build this app
(particularly promising was [boardgame.io](https://boardgame.io/)). However, I
chose to build my own game engine for a few reasons:

1. I wanted a good challenge
2. I wanted a serverless architecture
3. I wanted to try out XState

I had the following goals at the start of the project:

- Should be simple enough that my grandpa can figure out how to play.
- Should be easy to join a game – no creating accounts or logging in, just send
  out the URL and play.
- Serverless architecture (so I don't spend money to keep a server up when no
  games are being played).
- I wanted to use the [XState](https://xstate.js.org/docs/) library as much
  as I could to see if I like it enough to advocate for its use on other projects.

With these goals in mind, I chose the following stack:

- React app using XState to manage state and encode the game rules
- [Firebase Realtime Database](https://firebase.google.com/docs/database) to
  provide real-time updates to clients without needing my own Web Sockets server
- Firebase static file hosting and cloud functions to complete the serverless stack

## Technologies/libraries used

Frontend:

- TypeScript
- React
- React-Flexview
- Reach Router
- Typestyle

Backend:

- TypeScript
- Firebase
- Bolt

# Architecture

The app is deployed on Firebase and has the following main components:

- **Frontend**: A single-page React app, hosted on Firebase Hosting
- **Functions**: A set of Google Cloud Functions forming the "backend"
- **Database**: An instance of the Firebase Realtime Database

## Read via database, write via functions

Firebase Realtime Database encourages clients to connect directly using its subscription-based API.
It uses web sockets under the hood to push updates to clients as soon as they are written to the
database. The web clients read the game data in this way.

Data integrity is a concern whenever clients connect directly to a database. This is mitigated by
setting write permissions to false on the entire database. As for reads, since the app supports
additional players to spectate any game, much of the database has public read permissions, so anyone
in the world can read that data, via the app's UI.

Instead of allowing clients to write to the database directly, all game updates are handled via the
game's Cloud Functions APIs. This ensures (assuming the functions are written correctly, of course)
that game updates are applied properly, race conditions between clients can be avoided, and the
server can perform game actions for which a single client may not have the full information (such as
dealing the cards to all players). The Cloud Functions environment is given full database write
permissions via the Firebase Admin SDK (which bypasses the schema's read/write permissions), via a
secret app token that can be added locally and deployed (but listed in `.gitignore` to avoid being
checked in to source control).

## Game rules are a state machine

The central logic of this app is an XState machine (in `GameStateMachine.ts`) that encodes the rules
of the Euchre game. An XState machine is configured with a JavaScript object, which, by itself,
merely describes the behavior of the various state transitions and side effects. A machine can be
used in either of two ways:

- _Pure transition function_ `(prevState, event) => nextState`

  In its essence, a state machine is a pure (stateless) function, which can be called in any
  context to find out what the next state would be, for a given current state and event.

- _Interpreter_

  XState also allows us to instantiate an "interpreter" for a machine. This is a long-lived
  "service" that persists the current state, accepts events and updates the state accordingly, and
  executes any side effects specified by the machine.

  JavaScript clients can manually subscribe to transitions emitted by an interpreter service. To
  make this convenient for React clients, XState also ships with a `useMachine` hook that wraps an
  interpreter in a `[state, send]` interface, similar to that of `useReducer`.

The Game State Machine is used in both the frontend and backend:

- _Backend_: The `sendGameEvent` cloud function reads the current state from the database, runs the
  pure transition function against the event, and writes the next state back to the database.

- _Frontend_: The frontend also uses the pure transition function to test out events against the
  current state to see whether or not they would result in a state change. For example, this is used
  to disable cards that can't be played at a certain time.

## Private and Public State

The game state is stored as XState `State` objects, which can be directly consumed by the Game State
Machine. In order to correctly advance the game, the backend needs to be able to see all the
information in this object; but some information, such as the cards each player holds, is not public
and must be viewable only by that particular player. By convention, such private data is stored in a
"position record" whose property name starts with `private_`. For example:

```
private_hands: {
  north: /* north's cards */,
  south: /* south's cards */,
  east: /* east's cards */,
  west: /* west's cards */,
}
```

To enforce this privacy, the backend constructs and persists n+2 instances of the game
state object, at different database paths with the appropriate permissions:

- _Private copy_ (readable by the server only) with all data intact. This copy
  is the source of truth and is used by the backend to increment the game state.
- n _Player copies_, with any `private_` records containing only the entry for
  that particular player
- _Public copy (for spectators)_ with the `private_` data completely erased.

I chose this structure for simiplicity: storage is cheap and it's easier for
each client to subscribe to one particular database path and get all its info at once,
rather than having to subscribe to a public path and a player-specific path and
stitch together the game state.

**Game events can also contain secret info** (e.g. if a player passes a card to another player, face
down). Because an XState state object also contains the most recent event, we must also scrub that
data when applicable. We achieve this by adding an additional state to the machine after any such
event, which expects a no-op event (`SECRET_ACTION_COMPLETE`). When incrementing the game, if the
backend encounters a state that accepts `SECRET_ACTION_COMPLETE`, it will automatically send that
event to increment the machine again, and write only the final state to the database. Unfortunately,
this extra state and event must be manually configured in the state machine whenever the developer
identifies a particular event as containing secret info.

## Authentication

This app does not have a login-based auth system. Any player can access a game if they have its
ID/URL, and players can join by simply navigating to the game URL and typing in their name. This
zero-login UX is inspired by the simple approach in the [Horsepaste](https://horsepaste.com/) web
game.

When a player joins the game through the UI, their browser calls the `joinGame` cloud
function, which registers the player in the game and returns a
randomly-generated player ID token, which the browser persists in local storage.

This token serves a dual purpose:

- Identifies and authenticates the user to the `sendGameEvent` cloud function (the given player
  ID must be participating in that game for the event to be accepted)
- The player ID is part of the database path for a player's private game state (e.g.
  `/games/${gameId}/gameStates/privateJson/${playerId}`). That path can technically be read by
  anyone, but the database rules don't allow reading the `privateJson` node to see which player ID
  nodes it contains. Hence the player-specific node can be accessed only if the client can
  access its path directly.

Given the randomness and large range of player ID values, it's very unlikely that someone else would
be able to guess the player ID and act as that player in the game. This is admittedly less secure
than proper login and identity access control, but for a non-critical app such as this, it is a
reasonable tradeoff for the convenience of the player and developer not to have to deal with user
accounts.

## State Buffer

As the game is played out, the backend appends each new game state snapshot to an array in the
database containing all the states going back to the beginning of the game. The clients subscribe to
updates on that array node; however, they do not immediately update the UI to each new state as it
arrives. Instead, the snapshots get loaded into a client-side _state buffer_, which is itself an
XState machine interpreter. The buffer machine decides when to show each game state in the UI.

The state buffer benefits the user experience in several ways:

- If snapshots arrive at the client in quick succession, those snapshots can be played back more
  slowly so the user can see what happened
- Some states can block on user acknowledgement before proceeding
- Because all the snapshots are stored client-side, portions of the game can be replayed by
  iterating through the array
- After the user takes an action on their turn, the UI shows a "busy" state (e.g. a spinner on the
  button that the user clicked) while the game event is being sent to the server. The state buffer
  is also in charge of sending those game events to the backend, to ensure that the "busy" state is
  retained until both the API call resolves _and_ the next game state is available from the
  database.

# How to Dev

The app contains three pieces, each deployed separately via Firebase:

- Frontend
  - The React single-page app (seeded with create-react-app).
  - All the code is in the `frontend` directory
  - Scripts to build/run are defined in `package.json`
- Functions
  - The Firebase Cloud Functions (i.e. the "backend API")
  - All the code is in the `functions` directory
  - Scripts to build/run are defined in `package.json`
- Database
  - Schema is defined in `databaseSchema.bolt` and is built as part of the
    `functions` build.
  - [Bolt](https://github.com/FirebaseExtended/bolt) is a schema language for
    the Firebase DB that makes it nicer to declare types, relationships, and
    rules than the native `database.rules.json` file.
  - `database.rules.json` is the compiled schema file and is ignored by
    Git.
- `firebase.json` contains the firebase configuration for all three pieces.

You will also need a credential for the Firebase Admin SDK Service Account, **which must be ignored
by Git**. Get one on the [Firebase
Console](https://console.firebase.google.com/u/0/project/bid-euchre-9be3c/settings/serviceaccounts/adminsdk)
and save it to `functions/src/firebase/serviceAccountKey.ts`.

## Run locally

To run locally, I use three terminal windows, to continually compile the frontend and backend and
deploy it all with the Firebase emulators:

    # First terminal
    cd frontend
    yarn start

    # Second terminal
    cd functions
    yarn watch

    # Third terminal
    firebase emulators:start --inspect-functions

This setup will automatically watch the code for changes and re-deploy the functions when any code
changes.

The frontend can be viewed in development mode on port 3000 (webpack dev server), or in production
mode on port 5000. To get changes to propagate to port 5000, you must run `yarn build` in the
`frontend` directory.

### Local game

Navigate to http://localhost:3000/localGame to interact with a frontend-only version of the game.
The Local Game hydrates the game state from one of several pre-stored game snapshots (in
`LocalGameStates.tsx`) and displays a second row of cards that allow you to play as the user whose
turn it currently is. This allows us to test out UI for any part of the game without having to play
the game up to that point.

## Unit tests

The frontend codebase has a few unit tests. Run them as follows:

    cd frontend
    yarn test

## Deploy to prod

First, test thoroughly locally using the production frontend on port 5000, then run `firebase deploy`. This will build all the source code and deploy it to the correct locations.

There is no non-local staging environment. There is no CI pipeline.

## View the state machines

In a local build (via `yarn start`), you can view the state machine diagrams at the following
routes:

- http://localhost:3000/stateMachine – the euchre gameplay
- http://localhost:3000/gameContainerMachine – where players join the game
- http://localhost:3000/bufferMachine – state buffer
- http://localhost:3000/experimentStateMachine – a sandbox where I played around with stuff
- http://localhost:3000/transitionTestStateMachine – a sandbox where I played with game transitions

These visualizations use the `XStateViz` component, which was innovative in 2021, but now may be
obsolete due to the XState plugin for VS Code.

# Acknowledgements

Card SVG images downloaded from https://www.me.uk/cards/, where they have been
placed in the public domain.

More info on that card set:

- https://www.revk.uk/2018/06/svg-vector-playing-cards.html
- https://i-p-c-s.org/faq/tmfaq2.php
