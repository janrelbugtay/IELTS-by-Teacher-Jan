import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e');

async function run() {
    // Just find any submission with a recording
    const snap = await getDocs(collection(db, 'submissions'));
    for (const d of snap.docs) {
        if (d.data().assignmentType === 'speaking' && typeof d.data().answers === 'object') {
            for (const [id, data] of Object.entries(d.data().answers)) {
                let url = '';
                if (data && typeof data === 'object' && data.audioUrl) url = data.audioUrl;
                else if (typeof data === 'string') url = data;
                
                if (url && url.startsWith('subcollection:')) {
                    const subId = url.split(':')[1];
                    const docSnap = await getDoc(doc(db, 'submissions', d.id, 'recordings', subId));
                    if (docSnap.exists()) {
                        const storedUrl = docSnap.data().audioUrl;
                        console.log(`Sub ${d.id}, recording ${subId}, stored audioUrl starts with:`, storedUrl.substring(0, 50));
                        process.exit(0);
                    }
                }
            }
        }
    }
    console.log("No subcollection recordings found");
    process.exit(0);
}
run();
