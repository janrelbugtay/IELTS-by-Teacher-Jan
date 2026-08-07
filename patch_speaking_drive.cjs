const fs = require('fs');

let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

const targetStr = `                          const uploadResult = await Promise.race([uploadPromise, timeoutPromise]) as any;
                          const url = await getDownloadURL(uploadResult.ref);
                          return { qId, url };
                        } catch (err) {
                          console.warn("Storage upload failed, attempting to save to Firestore subcollection...", err);`;

const newCode = `                          const uploadResult = await Promise.race([uploadPromise, timeoutPromise]) as any;
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

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newCode);
    fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
    console.log("Patched ComputerSpeakingTest.tsx with Drive upload fallback");
} else {
    console.log("Could not find target string in ComputerSpeakingTest.tsx");
}
