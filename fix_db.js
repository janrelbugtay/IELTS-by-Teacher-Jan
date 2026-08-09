import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e');

async function run() {
    const snap = await getDocs(query(collection(db, 'submissions'), where('assignmentType', '==', 'writing')));
    let count = 0;
    for (const d of snap.docs) {
        const data = d.data();
        let ansStr = "";
        if (typeof data.answers === 'string') ansStr = data.answers;
        else ansStr = JSON.stringify(data.answers);
        
        if (ansStr.toLowerCase().includes('expenditure') || ansStr.toLowerCase().includes('country a')) {
            console.log("Updating", d.id);
            await updateDoc(doc(db, 'submissions', d.id), {
                assignmentId: '39',
                assignmentTitle: 'October Writing Practice'
            });
            count++;
        }
    }
    console.log("Updated", count);
    process.exit(0);
}
run();
