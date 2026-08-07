const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingPerformanceReport.tsx', 'utf8');

const offlineSection = `
          {audioUrl && (audioUrl.includes('drive.google.com') || audioUrl.includes('youtube.com') || audioUrl.includes('youtu.be') || audioUrl.includes('http')) && !audioUrl.startsWith('blob:') && (
            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-[14px] font-bold text-[#4F7DFF] tracking-wide uppercase mb-4">External Audio/Video Link</h3>
              {(() => {
                  let embedUrl = audioUrl;
                  if (audioUrl.includes('drive.google.com') && !audioUrl.includes('preview')) {
                      let match = audioUrl.match(/\\/d\\/([a-zA-Z0-9_-]+)/);
                      if (!match) match = audioUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                      if (match && match[1]) {
                          embedUrl = \`https://drive.google.com/file/d/\${match[1]}/preview\`;
                      }
                  } else if (audioUrl.includes('youtube.com/watch')) {
                      const urlParams = new URL(audioUrl).searchParams;
                      if (urlParams.has('v')) {
                          embedUrl = \`https://www.youtube.com/embed/\${urlParams.get('v')}\`;
                      }
                  } else if (audioUrl.includes('youtu.be/')) {
                      const match = audioUrl.match(/youtu\\.be\\/([a-zA-Z0-9_-]+)/);
                      if (match && match[1]) {
                          embedUrl = \`https://www.youtube.com/embed/\${match[1]}\`;
                      }
                  }
                  
                  if (embedUrl !== audioUrl || audioUrl.includes('drive.google.com') || audioUrl.includes('youtube')) {
                      return (
                          <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                              <iframe src={embedUrl} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen></iframe>
                          </div>
                      );
                  }
                  
                  return (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                           <a href={audioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline flex items-center gap-2">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                              </svg>
                              Open External Submission Link
                           </a>
                      </div>
                  );
              })()}
            </div>
          )}
          
          {/* Your Recordings / Uploading */}`;

code = code.replace('{/* Your Recordings / Uploading */}', offlineSection);

// Make sure getAudioUrl only falls back to audioUrl if it is NOT a drive/youtube link, 
// because we don't want `<audio>` tags rendering broken links.
const getAudioUrlCode = `  const getAudioUrl = (qId: string) => {
    if (Object.keys(responseUrls).length > 0 && responseUrls[qId]) {
      return responseUrls[qId];
    }
    return audioUrl || null;
  };`;

const newGetAudioUrlCode = `  const getAudioUrl = (qId: string) => {
    if (Object.keys(responseUrls).length > 0 && responseUrls[qId]) {
      return responseUrls[qId];
    }
    if (audioUrl && (audioUrl.includes('drive.google.com') || audioUrl.includes('youtube') || audioUrl.includes('youtu.be') || audioUrl.startsWith('http'))) {
      return null;
    }
    return audioUrl || null;
  };`;

code = code.replace(getAudioUrlCode, newGetAudioUrlCode);

fs.writeFileSync('src/components/SpeakingPerformanceReport.tsx', code);
console.log("Fixed external links");
