const fs = require('fs');
let content = fs.readFileSync('src/pages/CourseDetails.tsx', 'utf8');
const oldText = `    if (id === 'ielts') {
      homeworkFolders.push({
        title: 'April Writing Practice',
        icon: <PenTool className="w-8 h-8 text-indigo-600" />,
        desc: 'Take the April CD-IELTS writing test.',
        color: 'bg-indigo-50 border-indigo-600/20 hover:border-indigo-600',
        link: '/test/writing/15'
      });
      homeworkFolders.push({
        title: 'May Writing Practice',
        icon: <PenTool className="w-8 h-8 text-indigo-600" />,
        desc: 'Take the May CD-IELTS writing test.',
        color: 'bg-indigo-50 border-indigo-600/20 hover:border-indigo-600',
        link: '/test/writing/19'
      });
      homeworkFolders.push({
        title: 'June Writing Practice',
        icon: <PenTool className="w-8 h-8 text-indigo-600" />,
        desc: 'Take the June CD-IELTS writing test.',
        color: 'bg-indigo-50 border-indigo-600/20 hover:border-indigo-600',
        link: '/test/writing/23'
      });
      homeworkFolders.push({
        title: 'July Writing Practice',
        icon: <PenTool className="w-8 h-8 text-indigo-600" />,
        desc: 'Take the July CD-IELTS writing test.',
        color: 'bg-indigo-50 border-indigo-600/20 hover:border-indigo-600',
        link: '/test/writing/27'
      });
    }`;
const newText = `    if (id === 'ielts') {
      // additional ielts items if any
    }`;
if (content.includes(oldText)) {
  content = content.replace(oldText, newText);
  fs.writeFileSync('src/pages/CourseDetails.tsx', content);
  console.log("Patched CourseDetails.tsx");
} else {
  console.error("Could not find the text to replace.");
}
