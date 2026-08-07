const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingRecordingsReview.tsx', 'utf8');

const target = `          } else if (url.startsWith('idb:')) {
            const localId = url.split(':')[1];
            try {
              const blob = await getAudioFromIndexedDB(localId);
              if (blob) {
                url = URL.createObjectURL(blob);
              }
            } catch (e) {
              console.error("Failed to fetch recording from IndexedDB:", e);
            }
          }`;

const replacement = `          } else if (url.startsWith('idb:')) {
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
          }`;

if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', code);
    console.log("Fixed idb2");
} else {
    console.log("Not found in SpeakingRecordingsReview");
}
