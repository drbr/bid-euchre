/*
 * Import the dependencies needed for Firebase
 */

// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from 'firebase/app';

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import 'firebase/analytics';

// Add the Firebase products that you want to use
import 'firebase/auth';
import 'firebase/database';
import 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyBr-sNf5z0MFSSgf1_dEYOY2iESqh91kfc',
  authDomain: 'bid-euchre-9be3c.firebaseapp.com',
  databaseURL: 'https://bid-euchre-9be3c.firebaseio.com',
  projectId: 'bid-euchre-9be3c',
  storageBucket: 'bid-euchre-9be3c.appspot.com',
  messagingSenderId: '480279859950',
  appId: '1:480279859950:web:ad4148741423bf969999ff',
  measurementId: 'G-BCWQ11F2Q4',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Use local emulators when developing
if (window.location.hostname === 'localhost') {
  firebase.functions().useEmulator('localhost', 5001);
  firebase.database().useEmulator('localhost', 9000);
}
