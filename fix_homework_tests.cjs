const fs = require('fs');
let content = fs.readFileSync('src/pages/CourseDetails.tsx', 'utf8');

// 1. Add activeHomeworkFolder state
if (!content.includes('activeHomeworkFolder')) {
    content = content.replace(
        'const [activeTab, setActiveTab] = useState(initialTab);',
        'const [activeTab, setActiveTab] = useState(initialTab);\n  const [activeHomeworkFolder, setActiveHomeworkFolder] = useState<string | null>(null);'
    );
}

// 2. Replace Speaking Homework 1 with Speaking Homework and add action
const folderTarget = `{
        title: 'Speaking Homework 1',
        icon: <Mic className="w-8 h-8 text-purple-600" />,
        desc: 'Submit your speaking homework.',
        color: 'bg-purple-50 border-purple-600/20 hover:border-purple-600',
      }`;
      
const folderReplace = `{
        title: 'Speaking Homework',
        icon: <Mic className="w-8 h-8 text-purple-600" />,
        desc: 'Submit your speaking homework.',
        color: 'bg-purple-50 border-purple-600/20 hover:border-purple-600',
        action: () => setActiveHomeworkFolder('Speaking')
      }`;
      
content = content.replace(folderTarget, folderReplace);

// 3. Inject the activeHomeworkFolder view in renderHomework
const renderTarget = `  const renderHomework = () => {
    const homeworkFolders: any[] = [`;
    
const renderReplace = `  const renderHomework = () => {
    if (activeHomeworkFolder === 'Speaking') {
      const tests = [
        { id: 'homework_1', title: 'Speaking Homework Test 1', skill: 'Speaking', attempts: 1205, difficulty: 'Medium', duration: '15 mins', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60' },
        { id: 'homework_2', title: 'Speaking Homework Test 2', skill: 'Speaking', attempts: 856, difficulty: 'Medium', duration: '15 mins', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60' },
        { id: 'homework_3', title: 'Speaking Homework Test 3', skill: 'Speaking', attempts: 642, difficulty: 'Hard', duration: '15 mins', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60' },
      ];
      
      return (
        <div className="space-y-6">
          <button 
            onClick={() => setActiveHomeworkFolder(null)}
            className="flex items-center gap-2 text-[#1E4DB7] font-semibold hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Homework Folders
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
              <div key={test.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={test.image} 
                    alt={test.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                      {test.skill}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{test.title}</h3>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" /> {test.attempts.toLocaleString()} attempts
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <BarChart className="w-4 h-4 text-[#F4A340]" /> Difficulty: <span className="font-semibold text-slate-800">{test.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-[#1E4DB7]" /> {test.duration}
                    </div>
                  </div>
                     
                  <div className="mt-auto">
                    <Link 
                      to={\`/test/speaking/\${test.id}\`}
                      className="w-full py-3 bg-[#1E4DB7] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                    >
                      Start Test <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const homeworkFolders: any[] = [`;
    
content = content.replace(renderTarget, renderReplace);

// We also need to update the card rendering inside renderHomework to handle the `action`
const cardTarget = `            {folder.link ? (
              <Link 
                to={folder.link}
                className={\`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer\`}
              >
                <div className={\`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 \${folder.color}\`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </Link>
            ) : (
              <div 
                className={\`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer\`}
              >
                <div className={\`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 \${folder.color}\`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </div>
            )}`;
            
const cardReplace = `            {folder.link ? (
              <Link 
                to={folder.link}
                className={\`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer\`}
              >
                <div className={\`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 \${folder.color}\`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </Link>
            ) : folder.action ? (
              <button 
                onClick={folder.action}
                className={\`block w-full text-left h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer\`}
              >
                <div className={\`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 \${folder.color}\`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </button>
            ) : (
              <div 
                className={\`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer\`}
              >
                <div className={\`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 \${folder.color}\`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </div>
            )}`;

content = content.replace(cardTarget, cardReplace);

fs.writeFileSync('src/pages/CourseDetails.tsx', content);
console.log("CourseDetails.tsx patched successfully");
