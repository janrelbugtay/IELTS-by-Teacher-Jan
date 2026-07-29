const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

const oldSaveBlock = `                  // Save to Firebase
                  setIsSaving(true);
                  try {
                    // Upload audio
                    const audioRef = ref(storage, \`speaking_tests/\${user?.uid}/\${Date.now()}.webm\`);
                    const uploadTask = await uploadBytesResumable(audioRef, blob);
                    const downloadUrl = await getDownloadURL(uploadTask.ref);

                    // Determine title and ID
                    const testNum = id || '1';
                    const assignmentTitle = \`January Speaking Practice\`;
                    
                    // Create submission
                    await addDoc(collection(db, 'submissions'), {
                      userId: user?.uid,
                      assignmentId: testNum,
                      assignmentTitle: assignmentTitle,
                      assignmentType: 'speaking',
                      audioUrl: downloadUrl,
                      bandScore: 7, // Mock score for now
                      timeSpent: 14 * 60, // 14 mins
                      createdAt: serverTimestamp(),
                      answers: {}
                    });
                    
                    setIsSaving(false);
                    setStage(STAGES.PERFORMANCE);
                  } catch (error) {
                    console.error("Error saving test:", error);
                    setIsSaving(false);
                    alert("Failed to save recording, but you can still view your report.");
                    setStage(STAGES.PERFORMANCE);
                  }`;

const newSaveBlock = `                  // Go to performance stage immediately!
                  setStage(STAGES.PERFORMANCE);
                  
                  // Save to Firebase in the background
                  (async () => {
                    try {
                      // Upload audio
                      const audioRef = ref(storage, \`speaking_tests/\${user?.uid}/\${Date.now()}.webm\`);
                      const uploadTask = await uploadBytesResumable(audioRef, blob);
                      const downloadUrl = await getDownloadURL(uploadTask.ref);

                      // Determine title and ID
                      const testNum = id || '1';
                      const assignmentTitle = \`January Speaking Practice\`;
                      
                      // Create submission
                      await addDoc(collection(db, 'submissions'), {
                        userId: user?.uid,
                        assignmentId: testNum,
                        assignmentTitle: assignmentTitle,
                        assignmentType: 'speaking',
                        audioUrl: downloadUrl,
                        bandScore: 7, // Mock score for now
                        timeSpent: 14 * 60, // 14 mins
                        createdAt: serverTimestamp(),
                        answers: {}
                      });
                    } catch (error) {
                      console.error("Error saving test in background:", error);
                    }
                  })();`;

code = code.replace(oldSaveBlock, newSaveBlock);

// Remove the isSaving state definition and the loading screen overlay if it exists
code = code.replace(/const \[isSaving, setIsSaving\] = useState\(false\);\n?/, '');
code = code.replace(/\{isSaving && \([\s\S]*?\}\)[\s\S]*?<LiveSpeakingTestScreen/g, '<LiveSpeakingTestScreen');

fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
