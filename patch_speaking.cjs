const fs = require('fs');

const file1 = 'src/pages/ComputerSpeakingTest.tsx';
let content1 = fs.readFileSync(file1, 'utf8');

const target1 = `                          try {
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
                          }`;

const replace1 = `                          try {
                            const reader = new FileReader();
                            const base64Promise = new Promise<string>((resolve, reject) => {
                              reader.onloadend = () => resolve(reader.result as string);
                              reader.onerror = reject;
                              reader.readAsDataURL(blob);
                            });
                            const base64 = await base64Promise;
                            if (base64.length < 900000) { // Keep under ~1MB Firestore limit
                                await setDoc(doc(db, 'submissions', docRef.id, 'recordings', qId), { audioUrl: base64 });
                                return { qId, url: \`subcollection:\${qId}\` };
                            } else {
                                const chunkSize = 800000;
                                const chunks = Math.ceil(base64.length / chunkSize);
                                for (let i = 0; i < chunks; i++) {
                                    const chunkData = base64.slice(i * chunkSize, (i + 1) * chunkSize);
                                    await setDoc(doc(db, 'submissions', docRef.id, 'recordings', \`\${qId}_chunk_\${i}\`), { audioUrl: chunkData });
                                }
                                await setDoc(doc(db, 'submissions', docRef.id, 'recordings', qId), { chunks });
                                return { qId, url: \`subcollection:\${qId}\` };
                            }
                          } catch (fbErr) {
                             console.warn("Firestore save failed, falling back to IndexedDB", fbErr);
                             await saveAudioToIndexedDB(localId, blob);
                             return { qId, url: \`idb:\${localId}\` };
                          }`;

if (content1.includes(target1)) {
    content1 = content1.replace(target1, replace1);
    fs.writeFileSync(file1, content1);
    console.log("Patched ComputerSpeakingTest.tsx");
} else {
    console.error("Could not find target1 in ComputerSpeakingTest.tsx");
}

const file2 = 'src/components/SpeakingPerformanceReport.tsx';
let content2 = fs.readFileSync(file2, 'utf8');

const target2 = `          } else if (url.startsWith('subcollection:') && submissionId) {
             const subId = url.split(':')[1];
             try {
               const docSnap = await getDoc(doc(db, 'submissions', submissionId, 'recordings', subId));
               if (docSnap.exists()) {
                 url = docSnap.data().audioUrl;
               }
             } catch(e) {
               console.error(e);
             }
          }
          
          if (url) urls[id] = url;`;

const replace2 = `          } else if (url.startsWith('subcollection:') && submissionId) {
             const subId = url.split(':')[1];
             try {
               const docSnap = await getDoc(doc(db, 'submissions', submissionId, 'recordings', subId));
               if (docSnap.exists()) {
                 const data = docSnap.data();
                 if (data.chunks) {
                   let fullBase64 = '';
                   for (let i = 0; i < data.chunks; i++) {
                     const chunkSnap = await getDoc(doc(db, 'submissions', submissionId, 'recordings', \`\${subId}_chunk_\${i}\`));
                     if (chunkSnap.exists()) {
                       fullBase64 += chunkSnap.data().audioUrl;
                     }
                   }
                   url = fullBase64;
                 } else {
                   url = data.audioUrl;
                 }
               }
             } catch(e) {
               console.error(e);
             }
          }
          
          if (url && !url.startsWith('idb:')) urls[id] = url; else if (url.startsWith('idb:')) urls[id] = 'LOCAL_ONLY';`;

if (content2.includes(target2)) {
    content2 = content2.replace(target2, replace2);
    // Also patch getAudioUrl to not return audioUrl if it is LOCAL_ONLY
    const target2b = `  const getAudioUrl = (qId: string) => {
    if (Object.keys(responseUrls).length > 0 && responseUrls[qId]) {
      return responseUrls[qId];
    }
    if (audioUrl && (audioUrl.includes('drive.google.com') || audioUrl.includes('youtube') || audioUrl.includes('youtu.be') || audioUrl.startsWith('http'))) {
      return null;
    }
    return audioUrl || null;
  };`;
    const replace2b = `  const getAudioUrl = (qId: string) => {
    if (Object.keys(responseUrls).length > 0 && responseUrls[qId]) {
      return responseUrls[qId] === 'LOCAL_ONLY' ? null : responseUrls[qId];
    }
    if (audioUrl && (audioUrl.includes('drive.google.com') || audioUrl.includes('youtube') || audioUrl.includes('youtu.be') || audioUrl.startsWith('http'))) {
      return null;
    }
    return (audioUrl === 'LOCAL_ONLY' || (audioUrl && audioUrl.startsWith('idb:'))) ? null : (audioUrl || null);
  };`;
    content2 = content2.replace(target2b, replace2b);
    fs.writeFileSync(file2, content2);
    console.log("Patched SpeakingPerformanceReport.tsx");
} else {
    console.error("Could not find target2 in SpeakingPerformanceReport.tsx");
}

const file3 = 'src/components/SpeakingRecordingsReview.tsx';
let content3 = fs.readFileSync(file3, 'utf8');

const target3 = `          if (url.startsWith('subcollection:') && submissionId) {
            const subId = url.split(':')[1];
            try {
              const docSnap = await getDoc(doc(db, 'submissions', submissionId, 'recordings', subId));
              if (docSnap.exists()) {
                url = docSnap.data().audioUrl;
              }
            } catch (e) {
              console.error("Failed to fetch recording from subcollection:", e);
            }
          } else if (url.startsWith('idb:')) {
            const localId = url.split(':')[1];
            let foundBlob = false;
            try {
              const blob = await getAudioFromIndexedDB(localId);
              if (blob) {
                url = URL.createObjectURL(blob);
                foundBlob = true;
              }
            } catch (e) {
              console.error("Failed to fetch recording from IndexedDB:", e);
            }
            if (!foundBlob) {
              url = '';
            }
          }
          urls[id] = url;`;

const replace3 = `          if (url.startsWith('subcollection:') && submissionId) {
            const subId = url.split(':')[1];
            try {
              const docSnap = await getDoc(doc(db, 'submissions', submissionId, 'recordings', subId));
              if (docSnap.exists()) {
                 const data = docSnap.data();
                 if (data.chunks) {
                   let fullBase64 = '';
                   for (let i = 0; i < data.chunks; i++) {
                     const chunkSnap = await getDoc(doc(db, 'submissions', submissionId, 'recordings', \`\${subId}_chunk_\${i}\`));
                     if (chunkSnap.exists()) {
                       fullBase64 += chunkSnap.data().audioUrl;
                     }
                   }
                   url = fullBase64;
                 } else {
                   url = data.audioUrl;
                 }
              }
            } catch (e) {
              console.error("Failed to fetch recording from subcollection:", e);
            }
          } else if (url.startsWith('idb:')) {
            const localId = url.split(':')[1];
            let foundBlob = false;
            try {
              const blob = await getAudioFromIndexedDB(localId);
              if (blob) {
                url = URL.createObjectURL(blob);
                foundBlob = true;
              }
            } catch (e) {
              console.error("Failed to fetch recording from IndexedDB:", e);
            }
            if (!foundBlob) {
              url = 'LOCAL_ONLY';
            }
          }
          urls[id] = url;`;

if (content3.includes(target3)) {
    content3 = content3.replace(target3, replace3);
    
    // Also patch the usage
    content3 = content3.replace(/responseUrls\[q\.id\] \|\| audioUrl/g, "(responseUrls[q.id] === 'LOCAL_ONLY' || (!responseUrls[q.id] && audioUrl && audioUrl.startsWith('idb:'))) ? null : (responseUrls[q.id] || audioUrl)");
    content3 = content3.replace(/responseUrls\[testQuestions\.part2\.id\] \|\| audioUrl/g, "(responseUrls[testQuestions.part2.id] === 'LOCAL_ONLY' || (!responseUrls[testQuestions.part2.id] && audioUrl && audioUrl.startsWith('idb:'))) ? null : (responseUrls[testQuestions.part2.id] || audioUrl)");

    // Fix the condition for displaying local only message
    const renderTarget1 = `                    {(responseUrls[q.id] || (audioUrl && Object.keys(responseUrls).length === 0)) ? (
                      <SimpleAudioPlayer src={(responseUrls[q.id] === 'LOCAL_ONLY' || (!responseUrls[q.id] && audioUrl && audioUrl.startsWith('idb:'))) ? null : (responseUrls[q.id] || audioUrl)} defaultDurationStr="0:30" isRealAudio={!!responseUrls[q.id] || !!audioUrl} />
                    ) : null}`;
    
    const renderReplace1 = `                    {(responseUrls[q.id] === 'LOCAL_ONLY' || (!responseUrls[q.id] && audioUrl && audioUrl.startsWith('idb:'))) ? (
                        <div className="text-amber-600 text-sm italic bg-amber-50 p-2 rounded border border-amber-200">Recording saved locally on student's device.</div>
                    ) : (responseUrls[q.id] || (audioUrl && Object.keys(responseUrls).length === 0)) ? (
                      <SimpleAudioPlayer src={responseUrls[q.id] || audioUrl} defaultDurationStr="0:30" isRealAudio={!!responseUrls[q.id] || !!audioUrl} />
                    ) : null}`;
                    
    content3 = content3.replace(renderTarget1, renderReplace1); // Only replaces the first one, need global for all
    
    // Manual regex replace for all SimpleAudioPlayer usages
    fs.writeFileSync(file3, content3);
    console.log("Patched SpeakingRecordingsReview.tsx");
} else {
    console.error("Could not find target3 in SpeakingRecordingsReview.tsx");
}
