const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingPerformanceReport.tsx', 'utf8');

// Replace the responseUrls effect
const oldEffect = `  useEffect(() => {
    if (submissionData && submissionData.answers && Object.keys(submissionData.answers).length > 0) {
      const urls: Record<string, string> = {};
      for (const [id, data] of Object.entries(submissionData.answers)) {
        if (data && typeof data === 'object' && (data as any).audioUrl) {
          urls[id] = (data as any).audioUrl;
        } else if (typeof data === 'string') {
          urls[id] = data as string;
        }
      }
      setResponseUrls(urls);
    }
  }, [submissionData]);`;

const newEffect = `  useEffect(() => {
    const resolveUrls = async () => {
      if (submissionData && submissionData.answers && Object.keys(submissionData.answers).length > 0) {
        const urls: Record<string, string> = {};
        for (const [id, data] of Object.entries(submissionData.answers)) {
          let url = '';
          if (data && typeof data === 'object' && (data as any).audioUrl) {
            url = (data as any).audioUrl;
          } else if (typeof data === 'string') {
            url = data as string;
          }
          
          if (url.startsWith('idb:')) {
            const localId = url.split(':')[1];
            try {
              const blob = await getAudioFromIndexedDB(localId);
              if (blob) {
                url = URL.createObjectURL(blob);
              }
            } catch(e) {
              console.error(e);
            }
          } else if (url.startsWith('subcollection:') && submissionId) {
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
          
          if (url) urls[id] = url;
        }
        setResponseUrls(urls);
      }
    };
    resolveUrls();
  }, [submissionData, submissionId]);`;

code = code.replace(oldEffect, newEffect);

const oldPlay = `  const togglePlayAudio = async (qId: string) => {
    let url = getAudioUrl(qId);
    if (!url) {
      alert("No recording available for this test.");
      return;
    }

    if (playingId === qId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      if (url.startsWith('subcollection:') && submissionId) {
        const subId = url.split(':')[1];
        try {
          const docSnap = await getDoc(doc(db, 'submissions', submissionId, 'recordings', subId));
          if (docSnap.exists()) {
            url = docSnap.data().audioUrl;
          } else {
            alert("Recording not found in database.");
            return;
          }
        } catch (e) {
          console.error("Failed to fetch recording:", e);
          alert("Failed to fetch recording.");
          return;
        }
      } else if (url.startsWith('idb:')) {
        const localId = url.split(':')[1];
        try {
          const blob = await getAudioFromIndexedDB(localId);
          if (blob) {
            url = URL.createObjectURL(blob);
          } else {
            alert("Recording not found locally.");
            return;
          }
        } catch (e) {
          console.error("Failed to fetch local recording:", e);
          alert("Failed to fetch recording.");
          return;
        }
      }

      audioRef.current = new Audio(url);`;

const newPlay = `  const togglePlayAudio = (qId: string) => {
    let url = getAudioUrl(qId);
    if (!url) {
      alert("No recording available for this test.");
      return;
    }

    if (playingId === qId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(url);`;

code = code.replace(oldPlay, newPlay);
fs.writeFileSync('src/components/SpeakingPerformanceReport.tsx', code);
console.log("Patched async play policy issue");
