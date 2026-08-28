import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, initializeFirestore } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json"));
const app = initializeApp(config);

const dbSpecific = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, "ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e");

async function testDb(db, name) {
  try {
    const q = collection(db, "test");
    await getDocs(q);
    console.log(`Success with ${name}`);
  } catch (e) {
    console.error(`Error with ${name}: ${e.message}`);
  }
}

async function run() {
  await testDb(dbSpecific, "specific");
  process.exit(0);
}

run();
