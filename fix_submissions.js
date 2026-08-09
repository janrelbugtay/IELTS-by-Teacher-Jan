import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

// We need the firebase config
import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf-8');
const config = {};
envFile.split('\n').forEach(line => {
    if(line.trim() && !line.startsWith('#')) {
        const [k, v] = line.split('=');
        config[k.trim()] = (v || '').trim().replace(/"/g, '');
    }
});

const firebaseConfig = {
    apiKey: config.VITE_FIREBASE_API_KEY,
    authDomain: config.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: config.VITE_FIREBASE_PROJECT_ID,
    storageBucket: config.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: config.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
    console.log("Fetching submissions...");
    const snap = await getDocs(collection(db, 'submissions'));
    let count = 0;
    for (const d of snap.docs) {
        const data = d.data();
        if (data.assignmentId === '35' || data.assignmentTitle === 'September Writing Practice') {
            if (data.answers) {
                let text = "";
                if (typeof data.answers === 'string') {
                    text = data.answers.toLowerCase();
                } else if (typeof data.answers === 'object') {
                    text = JSON.stringify(data.answers).toLowerCase();
                }
                
                if (text.includes("expenditure") || text.includes("table gives information about") || text.includes("country a") || text.includes("country d")) {
                    console.log(`Updating submission ${d.id} to October`);
                    await updateDoc(doc(db, 'submissions', d.id), {
                        assignmentId: '39',
                        assignmentTitle: 'October Writing Practice'
                    });
                    count++;
                }
            }
        }
    }
    console.log(`Done. Updated ${count} submissions.`);
}
run();
