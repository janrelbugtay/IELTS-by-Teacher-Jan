import { storage } from './src/lib/firebase';
import { ref, listAll } from 'firebase/storage';

async function check() {
  const rootRef = ref(storage, 'speaking_tests');
  try {
    const res = await listAll(rootRef);
    console.log("Prefixes:", res.prefixes.length);
    console.log("Items:", res.items.length);
    for (const prefix of res.prefixes) {
      console.log("Folder:", prefix.fullPath);
    }
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
check();
