import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'), limit(15));
  const snap = await getDocs(q);
  snap.forEach(doc => {
    const data = doc.data();
    console.log(doc.id, "|", data.studentName, "|", data.assignmentTitle, "|", data.assignmentId, "| Score:", data.bandScore);
    if (data.assignmentId === '57') {
      console.log("Answers:", data.answers);
    }
  });
  process.exit(0);
}
run();
