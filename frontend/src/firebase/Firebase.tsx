/*
 * Import the dependencies needed for Firebase
 */

// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import 'firebase/analytics';

// Add the Firebase products that you want to use
import 'firebase/auth';
import 'firebase/database';

const firebaseConfig = {
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
