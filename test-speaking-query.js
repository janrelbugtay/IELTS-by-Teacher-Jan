import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "fifth-cargo-8k8sk",
  appId: "1:100436990047:web:e4ea91b3dce765783a23ea",
  apiKey: "AIzaSyBaDglBLoXB93712b3Z7Un3I6oZHHlM_7M",
  authDomain: "fifth-cargo-8k8sk.firebaseapp.com",
  storageBucket: "fifth-cargo-8k8sk.firebasestorage.app",
  messagingSenderId: "100436990047",
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {}, 'ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e');

async function test() {
  try {
    const d = await getDoc(doc(db, 'speaking_tests', '1'));
    console.log("Fetched test_settings! exists:", d.exists());
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
test();
