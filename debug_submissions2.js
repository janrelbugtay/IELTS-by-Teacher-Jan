import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e');

async function run() {
    const snap = await getDocs(query(collection(db, 'submissions'), where('assignmentType', '==', 'writing')));
    for (const d of snap.docs) {
        const data = d.data();
        let ansStr = "";
        if (typeof data.answers === 'string') ansStr = data.answers;
        else ansStr = JSON.stringify(data.answers);
        if (ansStr.toLowerCase().includes('expenditure') || data.assignmentTitle?.toLowerCase().includes('september')) {
            console.log("ID:", d.id, "Title:", data.assignmentTitle, "aId:", data.assignmentId);
        }
    }
    process.exit(0);
}
run();
