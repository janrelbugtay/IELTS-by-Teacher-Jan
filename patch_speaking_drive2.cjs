const fs = require('fs');

let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

const uploadBlockStr = `                        try {
                          const audioRef = ref(storage, \`speaking_tests/\${user?.uid}/\${Date.now()}_\${qId}.webm\`);
                          const uploadPromise = uploadBytes(audioRef, blob);
                          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000)); // shorter timeout
                          const uploadResult = await Promise.race([uploadPromise, timeoutPromise]) as any;
                          const url = await getDownloadURL(uploadResult.ref);
                          return { qId, url };
                        } catch (err) {
                          console.warn("Storage upload failed, attempting Google Drive integration...", err);
                          try {
                            const formData = new FormData();
                            formData.append("audio", blob, \`speaking_test_\${user?.uid}_\${Date.now()}_\${qId}.webm\`);
                            // Send to backend
                            const driveRes = await fetch("/api/upload-drive", {
                              method: "POST",
                              body: formData
                            });
                            const driveData = await driveRes.json();
                            if (driveData.success && driveData.webViewLink) {
                                return { qId, url: driveData.webViewLink };
                            } else {
                                throw new Error("Drive upload failed");
                            }
                          } catch (driveErr) {
                              console.warn("Drive upload failed, attempting to save to Firestore subcollection...", driveErr);`;

const newUploadBlock = `                        try {
                          console.log("Attempting Google Drive integration...");
                          const formData = new FormData();
                          formData.append("audio", blob, \`speaking_test_\${user?.uid}_\${Date.now()}_\${qId}.webm\`);
                          
                          const driveRes = await fetch("/api/upload-drive", {
                            method: "POST",
                            body: formData
                          });
                          const driveData = await driveRes.json();
                          if (driveData.success && driveData.webViewLink) {
                              return { qId, url: driveData.webViewLink };
                          } else {
                              throw new Error("Drive upload failed: " + (driveData.error || "Unknown"));
                          }
                        } catch (driveErr) {
                          console.warn("Drive upload failed, falling back to Firebase Storage...", driveErr);
                          try {
                            const audioRef = ref(storage, \`speaking_tests/\${user?.uid}/\${Date.now()}_\${qId}.webm\`);
                            const uploadPromise = uploadBytes(audioRef, blob);
                            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000));
                            const uploadResult = await Promise.race([uploadPromise, timeoutPromise]) as any;
                            const url = await getDownloadURL(uploadResult.ref);
                            return { qId, url };
                          } catch (err) {
                            console.warn("Storage upload failed, attempting to save to Firestore subcollection...", err);`;

if (code.includes(uploadBlockStr)) {
    code = code.replace(uploadBlockStr, newUploadBlock);
    fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
    console.log("Prioritized Drive upload in ComputerSpeakingTest.tsx");
} else {
    console.log("Could not find upload block");
}
