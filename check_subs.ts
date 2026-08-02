import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './src/lib/firebase';
async function run() {
    const snap = await getDocs(query(collection(db, 'submissions'), orderBy('createdAt', 'desc')));
    for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (data.assignmentId === '30' || (data.assignmentTitle || '').toLowerCase().includes('august listening')) {
            console.log(docSnap.id, data.studentName, "Score:", data.score, "BandScore:", data.bandScore, "Date:", data.createdAt?.toDate());
        }
    }
    process.exit(0);
}
run();
