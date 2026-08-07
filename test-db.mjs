import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'), limit(1));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    console.log("ID:", doc.id);
    const data = doc.data();
    console.log("Answers:", data.answers);
    console.log("TimeSpent:", data.timeSpent);
    console.log("Assignment:", data.assignmentId);
    console.log("Score:", data.bandScore);
  });
  process.exit(0);
}
run();
