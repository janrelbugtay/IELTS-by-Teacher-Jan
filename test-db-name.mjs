import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, 'submissions'), where('studentName', '==', 'DANG DUONG'), limit(5));
  const snap = await getDocs(q);
  let c = 0;
  snap.forEach(doc => {
    c++;
    const data = doc.data();
    console.log("ID:", doc.id);
    console.log("Answers:", data.answers);
    console.log("Assignment:", data.assignmentId);
    console.log("Score:", data.bandScore);
  });
  console.log("Total docs:", c);
  
  if (c === 0) {
    const q2 = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'), limit(5));
    const snap2 = await getDocs(q2);
    snap2.forEach(doc => {
      console.log("Recent:", doc.id, doc.data().studentName, doc.data().assignmentTitle, doc.data().answers, doc.data().assignmentId);
    });
  }
  process.exit(0);
}
run();
