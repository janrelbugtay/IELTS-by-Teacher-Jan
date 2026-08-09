import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e');

async function run() {
    const snap = await getDocs(query(collection(db, 'submissions'), orderBy('createdAt', 'desc'), limit(10)));
    for (const d of snap.docs) {
        const data = d.data();
        if (data.assignmentType === 'writing') {
            console.log("ID:", d.id, "Title:", data.assignmentTitle, "aId:", data.assignmentId);
            let ansStr = "";
            if (typeof data.answers === 'string') ansStr = data.answers;
            else ansStr = JSON.stringify(data.answers);
            console.log("Has expenditure?", ansStr.toLowerCase().includes('expenditure'));
            console.log("Snippet:", ansStr.substring(0, 100));
        }
    }
    process.exit(0);
}
run();
