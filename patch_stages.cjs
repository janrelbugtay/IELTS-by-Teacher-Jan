const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

code = code.replace(
  "PERFORMANCE: 'PERFORMANCE'",
  "PERFORMANCE: 'PERFORMANCE',\n  RECORDING: 'RECORDING'"
);

code = code.replace(
  "{ id: STAGES.PERFORMANCE, label: 'Performance Report', icon: BarChart }",
  "{ id: STAGES.PERFORMANCE, label: 'Performance Report', icon: BarChart },\n  { id: STAGES.RECORDING, label: 'Recordings', icon: FileText }"
);

code = code.replace(
  "import { SpeakingPerformanceReport } from '../components/SpeakingPerformanceReport';",
  "import { SpeakingPerformanceReport } from '../components/SpeakingPerformanceReport';\nimport { SpeakingRecordingsReview } from '../components/SpeakingRecordingsReview';"
);

// Add the recording stage JSX
code = code.replace(
  "</AnimatePresence>",
  `  {stage === STAGES.RECORDING && (
            <motion.div 
              key="recording"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto"
            >
              <SpeakingRecordingsReview testId={id} recordedAudio={recordedAudio} />
            </motion.div>
          )}

        </AnimatePresence>`
);

code = code.replace(
  "<SpeakingPerformanceReport testId={id} />",
  "<SpeakingPerformanceReport testId={id} onNext={() => setStage(STAGES.RECORDING)} />"
);

fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
