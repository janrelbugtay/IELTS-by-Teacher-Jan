import os

months = ["January", "February", "March", "April", "May", "June", "July"]

for month in months:
    filename = f"src/pages/{month}ListeningTest.tsx"
    if not os.path.exists(filename):
        continue
    
    with open(filename, "r") as f:
        content = f.read()

    if 'value={candidateNumber}' not in content:
        print(f"Adding candidateNumber to {filename}")
        search_str = """                  <input 
                      type="text" 
                      required
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 focus:bg-white" 
                      placeholder="Enter your full name" 
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>"""
        
        form_insertion = """
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-800">Candidate Number</label>
                  <input 
                      type="text" 
                      required
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 focus:bg-white" 
                      placeholder="Enter candidate number" 
                      value={candidateNumber}
                      onChange={(e) => setCandidateNumber(e.target.value)}
                  />
                  {candidateError && <p className="text-red-500 text-sm mt-1">{candidateError}</p>}
                </div>"""
        
        content = content.replace(search_str, search_str + "\n" + form_insertion)
        with open(filename, "w") as f:
            f.write(content)

