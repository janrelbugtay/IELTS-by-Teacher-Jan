import os
import glob

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to add the 'dropdown' type right after 'input'
    
    new_dropdown_code = """
                              {block.type === 'dropdown' && (
                                <select
                                  disabled={reviewMode}
                                  className={`w-full border-2 rounded-lg p-4 focus:outline-none transition-all shadow-inner font-bold text-[1em] appearance-none cursor-pointer ${
                                    reviewMode
                                      ? (isCorrect
                                          ? (colorTheme !== 'standard' ? 'bg-[#1a2e1a] border-green-800 text-green-400 pointer-events-none' : 'bg-green-50 border-green-300 text-green-900 pointer-events-none')
                                          : (colorTheme !== 'standard' ? 'bg-[#3a1a1a] border-red-800 text-red-400 pointer-events-none' : 'bg-red-50 border-red-400 text-red-700 pointer-events-none'))
                                      : `focus:border-blue-500 ${theme.input} ${theme.border}`
                                  }`}
                                  value={answers[q.id] || ''}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                >
                                  <option value="" disabled>Select an option...</option>
                                  {(q.options || block.options || []).map((opt: string) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              )}
"""
    
    if "block.type === 'dropdown'" not in content:
        content = content.replace("                              {block.type === 'input' && (", new_dropdown_code + "                              {block.type === 'input' && (")
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

for filepath in glob.glob("src/pages/*ReadingTest.tsx"):
    patch_file(filepath)

print("Done")
