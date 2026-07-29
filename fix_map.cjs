const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

code = code.replace(
`                    {options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}`,
`                    {options && options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}`
);
fs.writeFileSync('src/pages/ComputerReadingTest.tsx', code);
