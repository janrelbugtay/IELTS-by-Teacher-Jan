const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

// 1. Add hasRecorded state
code = code.replace(
  'const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);',
  'const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);\n  const [hasRecorded, setHasRecorded] = useState(false);'
);

// 2. Modify SetupStep parameters
code = code.replace(
  'const SetupStep = ({ title, description, children, onNext, autoNext, duration = 2000 }: any) => {',
  'const SetupStep = ({ title, description, children, onNext, autoNext, duration = 2000, canContinue = true }: any) => {'
);

// 3. Modify SetupStep button
const oldButton = `        {!autoNext && (
          <button 
            onClick={onNext}
            className="w-full bg-gradient-to-r from-[#4F7DFF] to-[#3B66E0] text-white py-4 rounded-2xl text-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Continue <ChevronRight size={20} />
          </button>
        )}`;
const newButton = `        {!autoNext && (
          <button 
            onClick={onNext}
            disabled={!canContinue}
            className={\`w-full py-4 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 \${canContinue ? 'bg-gradient-to-r from-[#4F7DFF] to-[#3B66E0] text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}\`}
          >
            Continue <ChevronRight size={20} />
          </button>
        )}`;
code = code.replace(oldButton, newButton);

// 4. Update SetupStep usage
const oldSetupUsage = `<SetupStep 
              key="mic" 
              title="Microphone Check" 
              description="Let's make sure we can hear you clearly."
              onNext={() => setStage(STAGES.TEST)} 
            >
              <MicCheckContent />
            </SetupStep>`;
const newSetupUsage = `<SetupStep 
              key="mic" 
              title="Microphone Check" 
              description="Let's make sure we can hear you clearly."
              onNext={() => setStage(STAGES.TEST)} 
              canContinue={hasRecorded}
            >
              <MicCheckContent onHasRecorded={() => setHasRecorded(true)} />
            </SetupStep>`;
code = code.replace(oldSetupUsage, newSetupUsage);

// 5. Modify MicCheckContent parameters
code = code.replace(
  'const MicCheckContent = () => {',
  'const MicCheckContent = ({ onHasRecorded }: { onHasRecorded?: () => void }) => {'
);

// 6. Call onHasRecorded when stop recording
const oldOnStop = `      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setLevel(0);
      };`;
const newOnStop = `      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        if (onHasRecorded) {
          onHasRecorded();
        }
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setLevel(0);
      };`;
code = code.replace(oldOnStop, newOnStop);

fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
