import re

with open("src/pages/CourseDetails.tsx", "r") as f:
    content = f.read()

replacement = """      homeworkFolders.push({
        title: 'June Listening Practice',
        icon: <Headphones className="w-8 h-8 text-indigo-600" />,
        desc: 'Take the June CD-IELTS listening test.',
        color: 'bg-indigo-50 border-indigo-600/20 hover:border-indigo-600',
        link: '/test/listening/22'
      });
      homeworkFolders.push({
        title: 'July Writing Practice',
        icon: <PenTool className="w-8 h-8 text-indigo-600" />,
        desc: 'Take the July CD-IELTS writing test.',
        color: 'bg-indigo-50 border-indigo-600/20 hover:border-indigo-600',
        link: '/test/writing/27'
      });"""

content = content.replace("""      homeworkFolders.push({
        title: 'June Listening Practice',
        icon: <Headphones className="w-8 h-8 text-indigo-600" />,
        desc: 'Take the June CD-IELTS listening test.',
        color: 'bg-indigo-50 border-indigo-600/20 hover:border-indigo-600',
        link: '/test/listening/22'
      });""", replacement)

with open("src/pages/CourseDetails.tsx", "w") as f:
    f.write(content)
