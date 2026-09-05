import re

filepath = 'src/pages/CourseDetails.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add action to Writing homework
bad = """      {
        title: 'IELTS Writing Homework',
        icon: <PenTool className="w-8 h-8 text-[#F4A340]" />,
        desc: 'Submit your writing homework.',
        color: 'bg-orange-50 border-[#F4A340]/20 hover:border-[#F4A340]',
      },"""

good = """      {
        title: 'IELTS Writing Homework',
        icon: <PenTool className="w-8 h-8 text-[#F4A340]" />,
        desc: 'Submit your writing homework.',
        color: 'bg-orange-50 border-[#F4A340]/20 hover:border-[#F4A340]',
        action: () => setActiveHomeworkFolder('Writing')
      },"""

content = content.replace(bad, good)

# Add Writing branch in renderHomework
speaking_branch = """    if (activeHomeworkFolder === 'Speaking') {"""

writing_branch = """    if (activeHomeworkFolder === 'Writing') {
      const tests = [
        { id: 'ielts-writing-homework-1', title: 'IELTS Writing Homework 1', skill: 'Writing', attempts: 1205, difficulty: 'Medium', duration: '60 mins', image: 'https://images.unsplash.com/photo-1455390582262-044cdead2708?w=800&auto=format&fit=crop&q=60' },
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
                      to={`/test/writing/${test.id}`}
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
    
    if (activeHomeworkFolder === 'Speaking') {"""

content = content.replace(speaking_branch, writing_branch)

with open(filepath, 'w') as f:
    f.write(content)

