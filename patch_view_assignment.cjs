const fs = require('fs');
let content = fs.readFileSync('src/pages/ViewAssignment.tsx', 'utf8');

// Update styling function
content = content.replace(
  "      case 'writing': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';",
  "      case 'writing': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';\n      case 'speaking': return 'text-purple-600 bg-purple-100 border-purple-200';"
);

// Display speaking parts if it's speaking
const speakingPartsDisplay = `
          {assignment.type === 'speaking' && assignment.speakingParts && (
            <div className="flex gap-2 mb-6">
              {assignment.speakingParts.part1 && <span className="text-xs font-semibold px-3 py-1 bg-natural-100 text-natural-700 rounded-full border border-natural-200">Part 1</span>}
              {assignment.speakingParts.part2 && <span className="text-xs font-semibold px-3 py-1 bg-natural-100 text-natural-700 rounded-full border border-natural-200">Part 2</span>}
              {assignment.speakingParts.part3 && <span className="text-xs font-semibold px-3 py-1 bg-natural-100 text-natural-700 rounded-full border border-natural-200">Part 3</span>}
            </div>
          )}
`;

content = content.replace(
  '<h1 className="text-4xl md:text-5xl font-serif text-natural-900 mb-6 leading-tight">{assignment.title}</h1>',
  speakingPartsDisplay + '\n          <h1 className="text-4xl md:text-5xl font-serif text-natural-900 mb-6 leading-tight">{assignment.title}</h1>'
);

// Change "Your Answer" instructions for speaking? The user can just type their answers or script. I'll just use the default text area for answers, unless audio recording is needed. The requirement doesn't explicitly mention audio recording for the student, but it's "speaking homework". 
// I'll leave the text area as is for submission, since the prompt just asked for admin features to add the questions and checkboxes.

fs.writeFileSync('src/pages/ViewAssignment.tsx', content);
