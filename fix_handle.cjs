const fs = require('fs');
let code = fs.readFileSync('src/pages/JanuaryListeningTest.tsx', 'utf8');

const target = `  const handleAnswerChange = (qNum: number, value: string) => {`;

const replace = `  const handleMultiSelect = (q1: number, q2: number, value: string, isChecked: boolean) => {
    setAnswers(prev => {
        const newAnswers = { ...prev };
        if (isChecked) {
            if (!newAnswers[q1]) {
                newAnswers[q1] = value;
            } else if (!newAnswers[q2] && newAnswers[q1] !== value) {
                newAnswers[q2] = value;
            }
        } else {
            if (newAnswers[q1] === value) {
                newAnswers[q1] = '';
                if (newAnswers[q2]) {
                    newAnswers[q1] = newAnswers[q2];
                    newAnswers[q2] = '';
                }
            } else if (newAnswers[q2] === value) {
                newAnswers[q2] = '';
            }
        }
        return newAnswers;
    });
  };

  const handleAnswerChange = (qNum: number, value: string) => {`;

code = code.replace(target, replace);
fs.writeFileSync('src/pages/JanuaryListeningTest.tsx', code);
