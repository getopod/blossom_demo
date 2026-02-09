
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  Auth
} from 'firebase/auth';
import type { User } from 'firebase/auth';

const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const firebaseConfig = {
  apiKey: getApiKey(),
  authDomain: "blossom-demo.firebaseapp.com",
  projectId: "blossom-demo",
  storageBucket: "blossom-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  } else {
    console.warn("Firebase: No API Key found in process.env.API_KEY");
  }
} catch (error) {
  console.error("Firebase failed:", error);
}

export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

export const signInWithGoogle = async () => {
  if (!authInstance) throw new Error("Auth not initialized");
  return signInWithPopup(authInstance, googleProvider);
};

export const signInWithFacebook = async () => {
  if (!authInstance) throw new Error("Auth not initialized");
  return signInWithPopup(authInstance, facebookProvider);
};

export const signInWithApple = async () => {
  if (!authInstance) throw new Error("Auth not initialized");
  return signInWithPopup(authInstance, appleProvider);
};

export const logout = async () => {
  if (!authInstance) return;
  return signOut(authInstance);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (!authInstance) {
    return () => {};
  }
  return onAuthStateChanged(authInstance, callback);
};
