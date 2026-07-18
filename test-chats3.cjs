const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const app = initializeApp({
  "projectId": "fifth-cargo-8k8sk",
  "appId": "1:100436990047:web:e4ea91b3dce765783a23ea",
  "apiKey": "AIzaSyBaDglBLoXB93712b3Z7Un3I6oZHHlM_7M",
  "authDomain": "fifth-cargo-8k8sk.firebaseapp.com",
  "storageBucket": "fifth-cargo-8k8sk.firebasestorage.app",
  "messagingSenderId": "100436990047"
});

const db = getFirestore(app, "ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e");

async function checkChats() {
  const snapshot = await getDocs(collection(db, 'chats'));
  snapshot.docs.forEach(doc => {
    if (doc.data().roomId === 'undefined' || doc.data().roomId === undefined) {
      console.log('Found problematic doc:', doc.data());
      console.log('Type of roomId:', typeof doc.data().roomId);
    }
  });
}

checkChats().catch(console.error);
