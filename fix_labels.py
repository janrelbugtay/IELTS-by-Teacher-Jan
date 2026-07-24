import re

with open('src/pages/MayListeningTest.tsx', 'r') as f:
    content = f.read()

# Replace <label className="mcq-label">
# with <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mb-2">
content = content.replace('<label className="mcq-label">', '<label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors mb-2">')

# Replace <input type="checkbox" name="q13_14" value="A" className="mcq-checkbox" ... />
# with <input type="checkbox" ... className="w-5 h-5 mt-0.5 shrink-0" />
content = re.sub(r'className="mcq-checkbox"', r'className="w-5 h-5 mt-0.5 shrink-0"', content)

# Replace <span className="font-bold mr-3">A</span>
# with <span className="font-bold w-6 shrink-0">A</span>
content = re.sub(r'<span className="font-bold mr-3">([A-Z])</span>', r'<span className="font-bold w-6 shrink-0">\1</span>', content)

# Also fix the 15-20 map labels that were not aligned
# In the first screenshot, the 15-20 inputs are spread out.
# Current code for 15-20:
# <div className="flex items-center justify-between"><span className="font-bold w-8">15</span><span className="flex-1">Exhibition</span> <input type="text" placeholder="15" className="ielts-input" value={answers[15] || ''} onChange={(e) => handleAnswerChange(15, e.target.value)} /></div>

def fix_map_input(match):
    num = match.group(1)
    text = match.group(2)
    # Make them closer together instead of space-between
    return f'<div className="flex items-center gap-4 bg-white p-2 border-b border-gray-100"><span className="font-bold w-8 text-gray-700">{num}</span><span className="w-32">{text}</span> <input type="text" placeholder="{num}" className="ielts-input flex-1 max-w-[120px]" value={{answers[{num}] || \'\'}} onChange={{(e) => handleAnswerChange({num}, e.target.value)}} /></div>'

content = re.sub(r'<div className="flex items-center justify-between"><span className="font-bold w-8">(\d+)</span><span className="flex-1">([^<]+)</span> <input type="text" placeholder="\d+" className="ielts-input" value={answers\[\d+\] \|\| \'\'} onChange={\(e\) => handleAnswerChange\(\d+, e\.target\.value\)} /></div>', fix_map_input, content)

with open('src/pages/MayListeningTest.tsx', 'w') as f:
    f.write(content)
print("Done")
