const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';"
);

// 2. Add refs to LiveSpeakingTestScreen
const stateVars = `  const [prepTime, setPrepTime] = useState(60);
  const [notes, setNotes] = useState('');`;
const refsToAdd = `  const [prepTime, setPrepTime] = useState(60);
  const [notes, setNotes] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Start continuous recording for the whole test
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        mediaRecorder.start();
      } catch (err) {
        console.error("Failed to start test recording:", err);
      }
    };
    startRecording();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);`;

code = code.replace(stateVars, refsToAdd);

// 3. Update the finish flow to return the Blob
const oldFinish = `      } else {
        onComplete(new Blob([])); // Mock Blob
      }`;
const newFinish = `      } else {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            onComplete(blob);
          };
          mediaRecorderRef.current.stop();
        } else {
          onComplete(new Blob([]));
        }
      }`;
code = code.replace(oldFinish, newFinish);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
