const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

const brokenPart = `              ;
                    } catch (error) {
                      console.error("Error saving test in background:", error);
                    }
                  })();
                } else {
                  alert("Test aborted or failed to record. Returning to dashboard.");
                  navigate('/');
                }
              }} />`;

const correctPart = `              <LiveSpeakingTestScreen onComplete={async (blob: Blob | undefined) => {
                if (blob) {
                  setRecordedAudio(blob);
                  
                  // Go to performance stage immediately!
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
                  })();
                } else {
                  alert("Test aborted or failed to record. Returning to dashboard.");
                  navigate('/');
                }
              }} />`;

code = code.replace(brokenPart, correctPart);
fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
