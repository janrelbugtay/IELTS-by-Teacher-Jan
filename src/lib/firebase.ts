import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e');
export const auth = getAuth();
export const secondaryAuth = getAuth(secondaryApp);
export const storage = getStorage(app);
