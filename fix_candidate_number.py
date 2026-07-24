import os
import re

months = ["January", "February", "March", "April", "May", "June", "July"]

for month in months:
    filename = f"src/pages/{month}ListeningTest.tsx"
    if not os.path.exists(filename):
        continue
    
    with open(filename, "r") as f:
        content = f.read()
    
    # 1. Add isAdmin to useAuth
    content = content.replace("const { user } = useAuth();", "const { user, isAdmin } = useAuth();")

    # 2. Add useEffect to set candidate number
    use_effect_str = """  useEffect(() => {
    if (isAdmin) {
      setCandidateNumber(expectedCandidateNumber);
    }
  }, [isAdmin]);
"""
    # Find a good place to insert this, perhaps after expectedCandidateNumber definition
    content = re.sub(
        r'(const expectedCandidateNumber = \'[A-Z0-9]+\';)',
        r'\1\n' + use_effect_str,
        content
    )

    # 3. Just to be safe and clear, let's also add a small note near the input if they are an admin
    # "Admin: Candidate number auto-filled"
    input_str = """                  <input 
                      type="text" 
                      required
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 focus:bg-white" 
                      placeholder="Enter candidate number" 
                      value={candidateNumber}
                      onChange={(e) => setCandidateNumber(e.target.value)}
                  />"""
    
    input_replacement = """                  <input 
                      type="text" 
                      required
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all bg-gray-50 focus:bg-white" 
                      placeholder="Enter candidate number" 
                      value={candidateNumber}
                      onChange={(e) => setCandidateNumber(e.target.value)}
                  />
                  {isAdmin && <p className="text-blue-600 text-xs mt-1 font-semibold">Admin: Candidate number auto-filled ({expectedCandidateNumber})</p>}"""

    content = content.replace(input_str, input_replacement)

    with open(filename, "w") as f:
        f.write(content)
    print(f"Updated {filename}")

