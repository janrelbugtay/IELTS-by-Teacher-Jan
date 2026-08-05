const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, limit } = require('firebase/firestore');
const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e');

async function run() {
  try {
    const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'), limit(5));
    const snap = await getDocs(q);
    snap.forEach(doc => {
      console.log(doc.id, '=>', JSON.stringify(doc.data(), null, 2));
    });
  } catch (e) { console.error(e); }
  process.exit(0);
}
run();
