# Bid Euchre

This is an online multiplayer web application that allows four players to play a
game of Bid Euchre over the internet.

It supports desktop computers and touch devices such as tablets and phones.
Supported browsers include latest Chrome, latest Firefox, and Safari 13 or
later.

# Implementation goals and stack

There do exist mature game engines that I could have used to build this app
(particularly promising is [boardgame.io](https://boardgame.io/)). However, I
chose to build my own game engine for a few reasons:

1. I wanted a good challenge
2. I wanted a serverless architecture
3. I wanted to try out XState

I had the following goals at the start of the project:

- Should be simple enough that my grandpa can figure out how to play.
- Should be easy to join a game – no creating accounts or logging in, just send
  out the URL and play.
- Serverless architecture (so I don't spend pay to keep a server up when no
  games are being played).
- I wanted to try out the [XState](https://xstate.js.org/docs/) library as much
  as I could and see how I liked it.

With these goals in mind, I chose the following stack:

- React app using XState to manage state and encode the game rules
- [Firebase Realtime Database](https://firebase.google.com/docs/database) to
  provide realtime updates to clients without needing my own Web Sockets server
- Firebase hosting and cloud functions to complete the serverless stack

# Architecture

## Read via database, write via functions

Firebase Realtime Database encourages clients to connect directly using its
subscription-based API. It uses web sockets under the hood to push updates to
clients as they are written to the database.

One might think security is a concern when clients connect directly to the
database. This is mitigated by being very careful about read/write permissions
on the various paths. Since the app supports spectating any game, much of the
data is indeed public, and anyone can read that data (via a client built with
the Firebase SDK).

All writes are forbidden from clients – data can be written only via the
Firebase Admin SDK, which is authorized via a secret app token. This app's Cloud
Functions environment is authorized with this token to use the Admin SDK. Hence,
all write-type operations can only occur via the client invoking one of the
app's cloud functions. This guards against bad data getting into the database.

## Game rules are a state machine

The central piece of this app is an XState machine (in `GameStateMachine.ts`)
that encodes the rules of the Euchre game.

An XState machine is configured as a JavaScript object, and it can be used in
either of two ways:

- _Pure transition function_ `(prevState, event) => nextState`

  In its essence, a state machine is a pure function, which can be used in any
  context to find out what the next state would be for any particular state and
  action.

- _Interpreter_

  XState also provides an "interpreter", which can be instantiated with a
  particular machine. The interpreter runs as a "service", which persists the
  current state, accepts events and updates the state accordingly, and executes
  side effects specified by the machine.

  Clients can subscribe to transitions emitted by the interpreter, and XState
  also ships with a `useMachine` React hook that wraps an interpreter in a
  `[state, send]` interface, similar to that of useReducer.

The Game State Machine is used in both the frontend and backend:

- _Backend_: The `sendGameEvent` cloud function reads the current state from the
  database, runs the pure transition function against the event, and writes the
  next state back to the database.

- _Frontend_: The frontend also uses the pure transition function to test out
  events against the current state to see if they would result in a state change
  or not. For example, this is used to disable cards that can't be played at a
  certain time.

## Private and Public State

The state of the game is stored as an XState State object. Some information in
the state's "context" (such as the cards each player holds) is not public and
must be viewable only by that player. By convention, such data is stored in a
"position record" whose property name starts with `private_`:

```
private_hands: {
  north: /* north's cards */,
  south: /* south's cards */,
  east: /* east's cards */,
  west: /* west's cards */,
}
```

To achieve this privacy, the backend actually persists n+2 instances of the game
state, at different database nodes with the appropriate permissions:

- _Private copy_ (readable by the server only) with all data intact. This copy
  is the source of truth and is used to increment the state.
- n _Player copies_, with any `private_` records containing only the value for
  that particular player
- _Public copy (for spectators)_ with the `private_` data completely erased.

I chose this structure for simiplicity: storage is cheap and it's easier for
each client to subscribe to one particular database node and get all the info,
rather than having to subscribe to a public node and a player-specific node and
stitch together the game state.

**Game events can also contain private info** (e.g. if a player passes a card to
another player, face down). Because an XState state object also contains the
most recent event, we must also scrub that data when applicable. We achieve this
by sending a second no-op event to the machine after any secret event. This must
be manually configured in the state machine whenever the developer identifies
some event as containing secret info.

# How to dev

The app contains three pieces, each deployed separately via Firebase:

- Frontend
  - The React single-page app (started with create-react-app).
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
  - `database.rules.json` in this codebase is a build artifact and is ignored by
    Git.

`firebase.json` contains the firebase configuration for all three pieces.

To deploy locally, I use three terminal windows, to continually compile the
frontend and backend and deploy it all with the Firebase emulators:

    # First terminal
    cd frontend
    yarn start

    # Second terminal
    cd functions
    yarn watch

    # Third terminal
    firebase emulators:start --inspect-functions

This setup will automatically watch the code for changes and re-deploy the
functions when any code changes.

The frontend can be viewed in development mode on port 3000 (webpack dev
server), or in production mode on port 5000. To get changes to propagate to port
5000, you must run `yarn build` in the `frontend` directory.

# Deploy to prod

First, test thoroughly locally using the production frontend on port 5000, then
deploy:

    firebase deploy

There is no non-local staging environment. There is no CI pipeline.

# Acknowledgements

Card SVG images downloaded from https://www.me.uk/cards/, where they have been
placed in the public domain.

More info on that card set:

- https://www.revk.uk/2018/06/svg-vector-playing-cards.html
- https://i-p-c-s.org/faq/tmfaq2.php
