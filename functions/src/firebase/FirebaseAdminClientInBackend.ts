import * as AdminSDK from 'firebase-admin';
import { serviceAccountKey } from './serviceAccountKey';

// Initialize the app with a service account, granting admin privileges
AdminSDK.initializeApp({
  credential: AdminSDK.credential.cert(
    serviceAccountKey as AdminSDK.ServiceAccount
  ),
  databaseURL: 'https://bid-euchre-9be3c.firebaseio.com',
});

export const firebaseDatabaseAdminClient = AdminSDK.database();
