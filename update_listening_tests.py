import os
import re

months = ["January", "February", "March", "April", "May", "June", "July"]

for month in months:
    filename = f"src/pages/{month}ListeningTest.tsx"
    if not os.path.exists(filename):
        print(f"{filename} not found, skipping...")
        continue
    
    with open(filename, "r") as f:
        content = f.read()

    expected_number = f"{month[:3].upper()}2026"
    
    # 1. Add state variables
    if "const [candidateNumber, setCandidateNumber]" not in content:
        state_insertion = f"const [candidateNumber, setCandidateNumber] = useState('');\n  const [candidateError, setCandidateError] = useState('');\n  const expectedCandidateNumber = '{expected_number}';"
        content = re.sub(r'(const \[studentName, setStudentName\] = useState[^;]+;)', r'\1\n  ' + state_insertion, content)
    
    # 2. Modify handleStart
    handle_start_old = r'const handleStart = \(e: React.FormEvent\) => {\s*e\.preventDefault\(\);\s*if \(studentName\.trim\(\)\) {\s*setHasStarted\(true\);\s*}\s*};'
    handle_start_new = f"""const handleStart = (e: React.FormEvent) => {{
    e.preventDefault();
    if (candidateNumber.trim().toUpperCase() !== expectedCandidateNumber) {{
      setCandidateError('Invalid Candidate Number. Please check with your administrator.');
      return;
    }}
    setCandidateError('');
    if (studentName.trim()) {{
      setHasStarted(true);
    }}
  }};"""
    content = re.sub(handle_start_old, handle_start_new, content)
    
    # 3. Add Candidate Number field to the form
    form_insertion = """                <div>
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
    
    # Find the Full Name field and add Candidate Number right after it
    if "Candidate Number" not in content.split("Select Test Mode")[0]:
        content = re.sub(
            r'(<label className="block text-sm font-bold mb-2 text-gray-800">Full Name</label>.*?</div>)',
            r'\1\n' + form_insertion,
            content,
            flags=re.DOTALL
        )

    with open(filename, "w") as f:
        f.write(content)
    print(f"Updated {filename}")
