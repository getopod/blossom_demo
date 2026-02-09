
import { initializeApp } from 'firebase/app';
// Fix: Consolidating imports from firebase/auth to resolve "no exported member" errors.
// These are standard exports in Firebase v9+ modular SDK.
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "blossom-demo.firebaseapp.com",
  projectId: "blossom-demo",
  storageBucket: "blossom-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Fix: In Firebase modular SDK, GoogleAuthProvider and FacebookAuthProvider constructors do not take arguments.
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithFacebook = () => signInWithPopup(auth, facebookProvider);
export const signInWithApple = () => signInWithPopup(auth, appleProvider);
export const logout = () => signOut(auth);

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
