import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  projectId: "revow-studio",
  appId: "1:295178732361:web:649391f4fb853128a65098",
  storageBucket: "revow-studio.firebasestorage.app",
  apiKey: "AIzaSyAGqX2HQV9O4Q38s42TT6HHAnVNzC9im5I",
  authDomain: "revow-studio.firebaseapp.com",
  messagingSenderId: "295178732361",
  measurementId: "G-NG12ZEZZCE",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, googleProvider };
