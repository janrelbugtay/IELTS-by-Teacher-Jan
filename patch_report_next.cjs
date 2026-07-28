const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingPerformanceReport.tsx', 'utf8');

code = code.replace(
  "export const SpeakingPerformanceReport = ({ testId, reportData = defaultReportData }: { testId?: string, reportData?: PerformanceReportData }) => {",
  "export const SpeakingPerformanceReport = ({ testId, onNext, reportData = defaultReportData }: { testId?: string, onNext?: () => void, reportData?: PerformanceReportData }) => {"
);

code = code.replace(
  `<button 
              onClick={() => navigate('/ielts/dashboard')}
              className="bg-[#4F7DFF] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-sm"
            >
              Return to Dashboard
            </button>`,
  `{onNext ? (
              <button 
                onClick={onNext}
                className="flex items-center gap-2 bg-[#4F7DFF] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                Review Recording <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/ielts/dashboard')}
                className="bg-[#4F7DFF] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                Return to Dashboard
              </button>
            )}`
);

fs.writeFileSync('src/components/SpeakingPerformanceReport.tsx', code);
