import * as admin from 'firebase-admin';
import * as serviceAccountKey from '../../config/serviceAccountKey';

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(JSON.stringify(serviceAccountKey)),
  databaseURL: 'https://bid-euchre-9be3c.firebaseio.com',
});

export const firebaseDatabaseAdminClient = admin.database();

// As an admin, the app has access to read and write all data, regardless of Security Rules
// const db = admin.database();
// const ref = db.ref('restricted_access/secret_document');
// ref.once('value', function (snapshot) {
//   console.log(snapshot.val());
// });


// Use local emulators when developing
// if (window.location.hostname === 'localhost') {
// firebaseDatabase.useEmulator('localhost', 9000);
// }
