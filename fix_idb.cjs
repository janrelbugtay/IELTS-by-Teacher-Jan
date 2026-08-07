const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingPerformanceReport.tsx', 'utf8');

const target = `          if (url.startsWith('idb:')) {
            const localId = url.split(':')[1];
            try {
              const blob = await getAudioFromIndexedDB(localId);
              if (blob) {
                url = URL.createObjectURL(blob);
              }
            } catch(e) {
              console.error(e);
            }
          }`;

const replacement = `          if (url.startsWith('idb:')) {
            const localId = url.split(':')[1];
            let foundBlob = false;
            try {
              const blob = await getAudioFromIndexedDB(localId);
              if (blob) {
                url = URL.createObjectURL(blob);
                foundBlob = true;
              }
            } catch(e) {
              console.error(e);
            }
            if (!foundBlob) {
              url = ''; // Prevent idb url from being used
            }
          }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/SpeakingPerformanceReport.tsx', code);
console.log("Fixed idb");
