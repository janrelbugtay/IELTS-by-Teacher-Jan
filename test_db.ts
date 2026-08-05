import { db } from './src/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

async function check() {
  const q = query(collection(db, 'submissions'), where('assignmentType', '==', 'speaking'));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.assignmentId !== 'offline_speaking') {
      console.log(`ID: ${doc.id}`);
      console.log(`Assignment Title: ${data.assignmentTitle}`);
      console.log(`Audio URL: ${data.audioUrl}`);
      console.log(`Answers Keys: ${Object.keys(data.answers || {})}`);
      console.log(`Answers Data: ${JSON.stringify(data.answers || {}).substring(0, 150)}`);
      console.log('---');
    }
  });
  process.exit(0);
}
check();
