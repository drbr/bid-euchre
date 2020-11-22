import * as AdminSDK from 'firebase-admin';
import { serviceAccountKey } from '../../config/serviceAccountKey';

// Initialize the app with a service account, granting admin privileges
AdminSDK.initializeApp({
  credential: AdminSDK.credential.cert(
    serviceAccountKey as AdminSDK.ServiceAccount
  ),
  databaseURL: 'https://bid-euchre-9be3c.firebaseio.com',
});

export const firebaseDatabaseAdminClient = AdminSDK.database();

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
