const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

const target = `                        try {
                          const audioRef = ref(storage, \`speaking_tests/\${user?.uid}/\${Date.now()}_\${qId}.webm\`);
                          const uploadPromise = uploadBytes(audioRef, blob);
                          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 30000));
                          const uploadResult = await Promise.race([uploadPromise, timeoutPromise]) as any;
                          const url = await getDownloadURL(uploadResult.ref);
                          return { qId, url };
                        } catch (err) {
                          console.warn("Storage upload failed or timed out, saving to IndexedDB locally:", err);
                          await saveAudioToIndexedDB(localId, blob);
                          return { qId, url: \`idb:\${localId}\` };
                        }`;

const replacement = `                        try {
                          const audioRef = ref(storage, \`speaking_tests/\${user?.uid}/\${Date.now()}_\${qId}.webm\`);
                          const uploadPromise = uploadBytes(audioRef, blob);
                          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000)); // shorter timeout
                          const uploadResult = await Promise.race([uploadPromise, timeoutPromise]) as any;
                          const url = await getDownloadURL(uploadResult.ref);
                          return { qId, url };
                        } catch (err) {
                          console.warn("Storage upload failed, attempting to save to Firestore subcollection...", err);
                          try {
                            const reader = new FileReader();
                            const base64Promise = new Promise<string>((resolve, reject) => {
                              reader.onloadend = () => resolve(reader.result as string);
                              reader.onerror = reject;
                              reader.readAsDataURL(blob);
                            });
                            const base64 = await base64Promise;
                            if (base64.length < 1000000) { // Keep under ~1MB Firestore limit
                                await setDoc(doc(db, 'submissions', docRef.id, 'recordings', qId), { audioUrl: base64 });
                                return { qId, url: \`subcollection:\${qId}\` };
                            } else {
                                console.warn("Audio too large for Firestore, falling back to IndexedDB");
                                await saveAudioToIndexedDB(localId, blob);
                                return { qId, url: \`idb:\${localId}\` };
                            }
                          } catch (fbErr) {
                             console.warn("Firestore save failed, falling back to IndexedDB", fbErr);
                             await saveAudioToIndexedDB(localId, blob);
                             return { qId, url: \`idb:\${localId}\` };
                          }
                        }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
    console.log("Replaced");
} else {
    console.log("Target not found!");
}
