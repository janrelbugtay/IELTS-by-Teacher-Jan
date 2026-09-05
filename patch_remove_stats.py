import re

filepath = 'src/pages/CourseDetails.tsx'
with open(filepath, 'r') as f:
    content = f.read()

bad = """                <div className="p-6 flex flex-col flex-1">
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
                  
                  <div className="mt-auto">"""

good = """                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{test.title}</h3>
                  <div className="mb-6"></div>
                  
                  <div className="mt-auto">"""

# Replace only the first occurrence which corresponds to the Writing Homework block
content = content.replace(bad, good, 1)

with open(filepath, 'w') as f:
    f.write(content)

