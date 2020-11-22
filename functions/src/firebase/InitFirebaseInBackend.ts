// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from 'firebase/app';

// Add the Firebase products that you want to use
import 'firebase/database'; // eslint-disable-line import/no-unassigned-import

import firebaseConfig from './firebaseConfig';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export const firebaseDatabase = firebase.database();

// Use local emulators when developing
// if (window.location.hostname === 'localhost') {
firebaseDatabase.useEmulator('localhost', 9000);
// }
