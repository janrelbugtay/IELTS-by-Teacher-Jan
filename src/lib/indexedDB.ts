export const saveAudioToIndexedDB = (id: string, blob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('AudioDB', 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('recordings')) {
          db.createObjectStore('recordings');
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction('recordings', 'readwrite');
        const store = tx.objectStore('recordings');
        store.put(blob, id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });
};

export const getAudioFromIndexedDB = (id: string): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('AudioDB', 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('recordings')) {
          db.createObjectStore('recordings');
        }
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('recordings')) {
          return resolve(null);
        }
        const tx = db.transaction('recordings', 'readonly');
        const store = tx.objectStore('recordings');
        const getReq = store.get(id);
        getReq.onsuccess = () => resolve(getReq.result || null);
        getReq.onerror = () => reject(getReq.error);
      };
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });
};
