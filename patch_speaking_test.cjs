const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

if (!code.includes('import { storage } from')) {
    code = code.replace(
        "import { db } from '../lib/firebase';",
        "import { db, storage } from '../lib/firebase';\nimport { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';"
    );
}

// Check if isSaving state already exists
if (!code.includes('isSaving')) {
    code = code.replace(
        "const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);",
        "const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);\n  const [isSaving, setIsSaving] = useState(false);"
    );
}

// Replace the onComplete handler
code = code.replace(
    /onComplete=\{\(blob: Blob \| undefined\) => \{([\s\S]*?)\}\} \/>/,
    `onComplete={async (blob: Blob | undefined) => {
                if (blob) {
                  setRecordedAudio(blob);
                  
                  // Save to Firebase
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
                  }
                } else {
                  alert("Test aborted or failed to record. Returning to dashboard.");
                  navigate('/');
                }
              }} />`
);

// We should also show a loading indicator if isSaving
if (!code.includes('Saving your test')) {
    code = code.replace(
        /<LiveSpeakingTestScreen/g,
        `{isSaving && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="text-xl font-bold text-slate-800">Saving your test...</h3>
                  <p className="text-slate-500 mt-2">Please wait while we process your recording</p>
                </div>
              )}
              <LiveSpeakingTestScreen`
    );
}

fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
