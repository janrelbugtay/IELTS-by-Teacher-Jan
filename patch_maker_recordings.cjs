const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingPerformanceReport.tsx', 'utf8');

const badText = `Maker Recordings`;
const goodText = `{submissionData?.status === 'processing' ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  Uploading your performance...
                </span>
              ) : (
                'Your Recordings'
              )}`;

code = code.replace(badText, goodText); // We can just replace the first instance inside the div
code = code.replace('{/* Maker Recordings */}', '{/* Your Recordings / Uploading */}');

fs.writeFileSync('src/components/SpeakingPerformanceReport.tsx', code);
console.log("Patched Maker Recordings");
