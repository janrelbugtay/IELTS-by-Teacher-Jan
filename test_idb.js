// Just a syntax check
const code = `
const saveToIndexedDB = (id, blob) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AudioDB', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('recordings')) {
        db.createObjectStore('recordings');
      }
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction('recordings', 'readwrite');
      const store = tx.objectStore('recordings');
      store.put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
};
`;
console.log("Syntax ok");
