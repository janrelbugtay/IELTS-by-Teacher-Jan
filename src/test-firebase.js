import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function test() {
  try {
    await signInWithEmailAndPassword(auth, "janrelbugtay03@gmail.com", "password123");
    console.log("Logged in");
    await addDoc(collection(db, 'assignments'), {
      title: "Test",
      description: "Test",
      type: "speaking",
      speakingParts: { part1: true, part2: true, part3: true },
      content: "Test",
      createdBy: auth.currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("Success!");
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
