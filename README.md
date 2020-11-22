# Bid Euchre App

This is an online multiplayer app to play [Bid Euchre](https://www.euchre.space), inspired by such
easy-to-use apps as [downforacross](https://downforacross.com/) and
[horsepaste](https://www.horsepaste.com/).

# Architecture

The app is deployed via Firebase and has the following main components:

- **Frontend**: A single-page React app, hosted on Firebase Hosting
- **Functions**: A set of Google Cloud Functions forming the "backend"
- **Database**: An instance of the Firebase Realtime Database

The frontend reads data directly from the database, but performs all writes via the Cloud Functions
APIs. This enables all clients to easily have the current game state pushed to them (at least the
parts that a single player is allowed to see), and likewise for the server to perform state updates
(such as dealing the cards) for which an individual player may not have the full information.

# How to Dev

`cd` into either the `frontend` or `functions` directories and build each using `yarn build`.
There are other scripts listed in the respective `package.json` files.

To test locally on the Firebase emulators, build both the frontend and functions, then run
`firebase emulators:start`.

To deploy to production, run `firebase deploy`. This will build all the source code and deploy it
to the correct locations.

You will also need a credential for the Firebase Admin SDK Service Account, which is not checked in
to source control. Get one on the [Firebase Console](https://console.firebase.google.com/u/0/project/bid-euchre-9be3c/settings/serviceaccounts/adminsdk).
