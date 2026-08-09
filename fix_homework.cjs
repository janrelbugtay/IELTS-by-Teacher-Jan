const fs = require('fs');
let content = fs.readFileSync('src/pages/CourseDetails.tsx', 'utf8');

const target = `    const homeworkFolders: any[] = [
      {
        title: 'Reading Homework',
        icon: <BookOpen className="w-8 h-8 text-[#1E4DB7]" />,
        desc: 'Complete reading homework.',
        color: 'bg-blue-50 border-[#1E4DB7]/20 hover:border-[#1E4DB7]',
      },
      {
        title: 'Listening Homework',
        icon: <Headphones className="w-8 h-8 text-teal-600" />,
        desc: 'Listen to audio and answer questions.',
        color: 'bg-teal-50 border-teal-600/20 hover:border-teal-600',
      },
      {
        title: 'Writing Homework',
        icon: <PenTool className="w-8 h-8 text-[#F4A340]" />,
        desc: 'Submit your writing homework.',
        color: 'bg-orange-50 border-[#F4A340]/20 hover:border-[#F4A340]',
      },
      {
        title: 'Speaking Homework',
        icon: <Mic className="w-8 h-8 text-purple-600" />,
        desc: 'Submit your speaking homework.',
        color: 'bg-purple-50 border-purple-600/20 hover:border-purple-600',
      }
    ];`;

const replacement = `    const homeworkFolders: any[] = [
      {
        title: 'Reading Homework',
        icon: <BookOpen className="w-8 h-8 text-[#1E4DB7]" />,
        desc: 'Complete reading homework.',
        color: 'bg-blue-50 border-[#1E4DB7]/20 hover:border-[#1E4DB7]',
      },
      {
        title: 'Listening Homework',
        icon: <Headphones className="w-8 h-8 text-teal-600" />,
        desc: 'Listen to audio and answer questions.',
        color: 'bg-teal-50 border-teal-600/20 hover:border-teal-600',
      },
      {
        title: 'Writing Homework',
        icon: <PenTool className="w-8 h-8 text-[#F4A340]" />,
        desc: 'Submit your writing homework.',
        color: 'bg-orange-50 border-[#F4A340]/20 hover:border-[#F4A340]',
      },
      {
        title: 'Speaking Homework 1',
        isSpeakingHomeworkCard: true
      }
    ];`;

content = content.replace(target, replacement);

const target2 = `    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {homeworkFolders.map((folder, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            {folder.link ? (
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
            )}
          </motion.div>
        ))}
      </div>
    );`;

const replacement2 = `    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {homeworkFolders.map((folder, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            {folder.isSpeakingHomeworkCard ? (
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=60" 
                      alt="Speaking Homework" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 left-4 z-20">
                      <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                        Speaking
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{folder.title}</h3>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" /> 0 attempts
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <BarChart className="w-4 h-4 text-[#F4A340]" /> Difficulty: <span className="font-semibold text-slate-800">Medium</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-[#1E4DB7]" /> 15 mins
                      </div>
                    </div>
                       
                    <div className="mt-auto">
                      <button className="w-full py-3 bg-[#1E4DB7] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                        Start Test <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
            ) : folder.link ? (
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
            )}
          </motion.div>
        ))}
      </div>
    );`;

content = content.replace(target2, replacement2);
fs.writeFileSync('src/pages/CourseDetails.tsx', content);
