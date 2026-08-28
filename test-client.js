import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  projectId: "fifth-cargo-8k8sk",
  appId: "1:100436990047:web:e4ea91b3dce765783a23ea",
  apiKey: "AIzaSyBaDglBLoXB93712b3Z7Un3I6oZHHlM_7M",
  authDomain: "fifth-cargo-8k8sk.firebaseapp.com",
  storageBucket: "fifth-cargo-8k8sk.firebasestorage.app",
  messagingSenderId: "100436990047",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function test() {
  try {
    await signInWithEmailAndPassword(auth, "janrelbugtay03@gmail.com", "janrel123");
    console.log("Logged in as " + auth.currentUser.uid);
    await getDocs(collection(db, 'assignments'));
    console.log("Fetched assignments");
    await getDocs(collection(db, 'submissions'));
    console.log("Fetched submissions");
    await getDocs(collection(db, 'users'));
    console.log("Fetched users");
    await getDocs(collection(db, 'classes'));
    console.log("Fetched classes");
    await getDocs(collection(db, 'students'));
    console.log("Fetched students");
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
test();
