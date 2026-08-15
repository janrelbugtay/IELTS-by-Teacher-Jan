const fs = require('fs');

let content = fs.readFileSync('src/pages/CreateAssignment.tsx', 'utf8');

// Add speaking to type
content = content.replace(
  "const [type, setType] = useState<'reading' | 'listening' | 'writing'>('reading');",
  "const [type, setType] = useState<'reading' | 'listening' | 'writing' | 'speaking'>('reading');\n  const [speakingParts, setSpeakingParts] = useState({ part1: true, part2: true, part3: true });"
);

// Add speakingParts to firestore
content = content.replace(
  "type,",
  "type,\n        ...(type === 'speaking' ? { speakingParts } : {}),"
);

// Add speaking option
content = content.replace(
  '<option value="writing">Writing</option>',
  '<option value="writing">Writing</option>\n              <option value="speaking">Speaking</option>'
);

// Add checkboxes conditionally
const checkboxesCode = `
          {type === 'speaking' && (
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-natural-800 mb-2">Speaking Parts</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={speakingParts.part1}
                    onChange={(e) => setSpeakingParts(prev => ({ ...prev, part1: e.target.checked }))}
                    className="w-4 h-4 text-natural-900 border-natural-300 rounded focus:ring-natural-900"
                  />
                  <span>Part 1</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={speakingParts.part2}
                    onChange={(e) => setSpeakingParts(prev => ({ ...prev, part2: e.target.checked }))}
                    className="w-4 h-4 text-natural-900 border-natural-300 rounded focus:ring-natural-900"
                  />
                  <span>Part 2</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={speakingParts.part3}
                    onChange={(e) => setSpeakingParts(prev => ({ ...prev, part3: e.target.checked }))}
                    className="w-4 h-4 text-natural-900 border-natural-300 rounded focus:ring-natural-900"
                  />
                  <span>Part 3</span>
                </label>
              </div>
            </div>
          )}
`;

content = content.replace(
  '</select>\n          </div>',
  '</select>\n          </div>' + checkboxesCode
);

// Update description for speaking
content = content.replace(
  'For Listening: Provide a link to the audio and the questions.',
  'For Listening: Provide a link to the audio and the questions.\n              For Speaking: Provide the questions for the selected parts.'
);

fs.writeFileSync('src/pages/CreateAssignment.tsx', content);
