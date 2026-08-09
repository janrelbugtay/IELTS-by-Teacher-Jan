import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e');

async function run() {
    const snap = await getDocs(collection(db, 'submissions'));
    for (const d of snap.docs) {
        if (d.data().assignmentType === 'speaking' && typeof d.data().answers === 'object') {
            const answers = d.data().answers;
            for (const [id, data] of Object.entries(answers)) {
                let url = '';
                if (data && typeof data === 'object' && data.audioUrl) url = data.audioUrl;
                else if (typeof data === 'string') url = data;
                
                if (url) {
                    console.log(`Sub ${d.id}, recording ${id}, url:`, url.substring(0, 80));
                    process.exit(0);
                }
            }
        }
    }
    console.log("No speaking recordings found");
    process.exit(0);
}
run();
