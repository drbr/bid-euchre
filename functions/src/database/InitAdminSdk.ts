import * as admin from 'firebase-admin';
import serviceAccount from '../../config/serviceAccountKey';

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://bid-euchre-9be3c.firebaseio.com',
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
// const db = admin.database();
// const ref = db.ref('restricted_access/secret_document');
// ref.once('value', function (snapshot) {
//   console.log(snapshot.val());
// });
