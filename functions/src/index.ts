import * as functions from 'firebase-functions';
import executeNewGame from './activities/executeNewGame';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

export const makeUppercase = functions.database
  .ref('/messages/{pushId}/original')
  .onCreate((snapshot, context) => {
    const original = snapshot.val();
    console.log('Uppercasing', context.params.pushId, original);
    const uppercase = original.toUpperCase();
    return snapshot.ref.parent!.child('uppercase').set(uppercase);
  });

export const newGame = functions.https.onCall((data, context) => {
  return executeNewGame();
});
