const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Since we can't easily query firestore from node script without service account,
// let's look at the routing for writing tests.
