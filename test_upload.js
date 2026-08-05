import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { getAuth, signInAnonymously } from "firebase/auth";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

async function run() {
  try {
    const cred = await signInAnonymously(auth);
    const storageRef = ref(storage, 'test_file.txt');
    const res = await uploadString(storageRef, 'Hello World');
    console.log("Upload successful!");
    const url = await getDownloadURL(res.ref);
    console.log("URL:", url);
  } catch (e) {
    console.error("Upload failed:", e.code, e.message);
  }
  process.exit(0);
}
run();
