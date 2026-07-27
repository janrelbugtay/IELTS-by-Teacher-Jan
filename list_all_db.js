import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId || 'ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e');

async function check() {
    const q = query(collection(db, 'submissions'), where('assignmentType', '==', 'writing'));
    const snap = await getDocs(q);
    let docs = [];
    snap.forEach(d => docs.push({ id: d.id, ...d.data() }));
    docs.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
    for(let i=0; i<docs.length; i++) {
        console.log(docs[i].id, docs[i].assignmentTitle, docs[i].assignmentId, docs[i].createdAt?.toDate());
    }
    process.exit(0);
}
check().catch(console.error);
