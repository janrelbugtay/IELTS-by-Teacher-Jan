const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingPerformanceReport.tsx', 'utf8');

code = code.replace(`{/* {submissionData?.status === 'processing' ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  Uploading your performance...
                </span>
              ) : (
                'Your Recordings'
              )} */}`, `{/* Your Recordings / Uploading */}`);

code = code.replace(`Maker Recordings`, `{submissionData?.status === 'processing' ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  Uploading your performance...
                </span>
              ) : (
                'Your Recordings'
              )}`);

fs.writeFileSync('src/components/SpeakingPerformanceReport.tsx', code);
console.log("Fixed Maker Recordings");
