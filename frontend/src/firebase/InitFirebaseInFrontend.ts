// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from 'firebase/app';

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import 'firebase/analytics';

// Add the Firebase products that you want to use
import 'firebase/auth';
import 'firebase/database';
import 'firebase/functions';

import firebaseConfig from './firebaseConfig';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export const firebaseFunctions = firebase.functions();
export const firebaseDatabase = firebase.database();

// Use local emulators when developing
if (window.location.hostname === 'localhost') {
  firebaseFunctions.useEmulator('localhost', 5001);
  firebaseDatabase.useEmulator('localhost', 9000);
}
