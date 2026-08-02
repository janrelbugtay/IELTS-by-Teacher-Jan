import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/lib/firebase';
async function run() {
    const snap = await getDocs(collection(db, 'submissions'));
    for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (data.assignmentId === '30' || (data.assignmentTitle || '').toLowerCase().includes('august listening')) {
            console.log(data.studentName, data.bandScore);
        }
    }
    process.exit(0);
}
run();
