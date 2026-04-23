import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// These are your CLIENT-SIDE (public) Firebase config values.
const firebaseConfig = {
  apiKey: "AIzaSyA6L7qHMGeh0Bw9GqWRSZfqAqhUioulQUQ",
  authDomain: "outty-dev-3a0b1.firebaseapp.com",
  projectId: "outty-dev-3a0b1",
  storageBucket: "outty-dev-3a0b1.firebasestorage.app",
  messagingSenderId: "349245259412",
  appId: "1:349245259412:web:ca08daf63c28a13beafe81"
};

const app      = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();