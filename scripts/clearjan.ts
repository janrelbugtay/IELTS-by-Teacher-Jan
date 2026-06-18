import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function clear() {
  const querySnapshot = await getDocs(collection(db, 'submissions'));
  querySnapshot.forEach(async (d) => {
    const data = d.data();
    if (data.assignmentId === '3' || data.title?.includes('January')) {
      await deleteDoc(doc(db, 'submissions', d.id));
      console.log('Deleted', d.id);
    }
  });
  console.log('Done');
}

clear();
