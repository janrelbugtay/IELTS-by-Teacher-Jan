const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingRecordingsReview.tsx', 'utf8');

const search = `{isOffline && audioUrl && audioUrl.startsWith('http') ? (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Video className="w-6 h-6 text-[#4F7DFF]" />
                    <div>
                        <span className="block text-blue-900 font-bold text-sm">Student Video / Audio</span>
                        <span className="block text-blue-700/70 text-xs mt-0.5">Click to view in a new tab</span>
                    </div>
                  </div>
                  <a href={audioUrl} target="_blank" rel="noopener noreferrer" className="bg-[#4F7DFF] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200">
                    Open Link <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
            ) : (
                <SimpleAudioPlayer src={audioUrl} defaultDurationStr={isOffline ? "Audio Recording" : "Full Recording"} isRealAudio={!!audioUrl} />
            )}`;

const replace = `{isOffline && audioUrl && audioUrl.startsWith('http') ? (
                (() => {
                    let embedUrl = audioUrl;
                    if (audioUrl.includes('drive.google.com') && !audioUrl.includes('preview')) {
                        const match = audioUrl.match(/\\/d\\/([a-zA-Z0-9_-]+)/);
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
                    return (
                        <div className="w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative" style={{ paddingTop: '56.25%' }}>
                            <iframe 
                                src={embedUrl} 
                                className="absolute inset-0 w-full h-full"
                                allow="autoplay; encrypted-media; fullscreen" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    );
                })()
            ) : (
                <SimpleAudioPlayer src={audioUrl} defaultDurationStr={isOffline ? "Audio Recording" : "Full Recording"} isRealAudio={!!audioUrl} />
            )}`;

if(code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', code);
    console.log('patched embed successfully');
} else {
    console.log('could not find embed search string');
}
