# Bid Euchre

This is an online multiplayer web application that allows four players to play a game of
Bid Euchre over the internet.

It supports desktop computers and touch devices such as tablets and phones.
Supported browsers include latest Chrome, latest Firefox, and Safari 13 or later.

# Implementation details

## Goals

- Should be simple enough that my grandpa can figure out how to play.
- Should be easy to join a game – no creating accounts or logging in, just send out the URL and play.
- Serverless architecture (so I don't spend pay to keep a server up when no games are being played).
- I wanted to try out the [XState](https://xstate.js.org/docs/) library and see how I liked it.

With these goals in mind, I chose the following stack:

- React app using XState to encode the game rules (and anywhere else it might be useful)
- [Firebase Realtime Database](https://firebase.google.com/docs/database) to provide realtime
  updates to clients without needing my own Web Sockets server
- Firebase hosting and cloud functions to complete the serverless stack

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
  - Schema is defined in `databaseSchema.bolt` and is built as part of the `functions` build.
  - [Bolt](https://github.com/FirebaseExtended/bolt) is a schema language for the Firebase DB
    that makes it nicer to declare types, relationships, and rules than the native `database.rules.json`
    file.
  - `database.rules.json` in this codebase is a build artifact and is ignored by Git.

`firebase.json` contains the firebase configuration for all three pieces.

To deploy locally, I use three terminal windows, to continually compile the frontend and backend and deploy it all with the Firebase emulators:

    # First terminal
    cd frontend
    yarn start

    # Second terminal
    cd functions
    yarn watch

    # Third terminal
    firebase emulators:start --inspect-functions

This setup will automatically watch the code for changes and re-deploy the functions when any code changes.

The frontend can be viewed in development mode on port 3000 (webpack dev server), or in production mode on port 5000. To get changes to propagate to port 5000, you must run `yarn build` in the `frontend` directory.

# Deploy to prod

First, test thoroughly locally using the production frontend on port 5000, then deploy:

    firebase deploy

There is no non-local staging environment. There is no CI pipeline.

# Acknowledgements

Card SVG images downloaded from https://www.me.uk/cards/, where they have been placed in the
public domain.

More info on that card set:

- https://www.revk.uk/2018/06/svg-vector-playing-cards.html
- https://i-p-c-s.org/faq/tmfaq2.php
