import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e');

async function run() {
    const snap = await getDocs(query(collection(db, 'submissions'), where('assignmentType', '==', 'speaking'), orderBy('createdAt', 'desc'), limit(5)));
    for (const d of snap.docs) {
        const data = d.data();
        console.log("ID:", d.id, "Title:", data.assignmentTitle);
        const answers = data.answers || {};
        for (const [qId, qData] of Object.entries(answers)) {
             let url = '';
             if (typeof qData === 'string') url = qData;
             else if (qData && qData.audioUrl) url = qData.audioUrl;
             console.log(` - ${qId}: ${url.substring(0, 100)}`);
        }
    }
    process.exit(0);
}
run();
