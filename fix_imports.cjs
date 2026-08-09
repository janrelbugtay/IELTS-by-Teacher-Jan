const fs = require('fs');
let content = fs.readFileSync('src/pages/CourseDetails.tsx', 'utf8');

const target = `import { ArrowLeft, Headphones, Mic, BookOpen, PenTool, Activity, Trophy, Medal, Star, Flame, Search, ChevronDown, Award } from 'lucide-react';`;
const replacement = `import { ArrowLeft, Headphones, Mic, BookOpen, PenTool, Activity, Trophy, Medal, Star, Flame, Search, ChevronDown, Award, Users, BarChart, Clock, ArrowRight } from 'lucide-react';`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/pages/CourseDetails.tsx', content);
    console.log('Imports patched');
}
