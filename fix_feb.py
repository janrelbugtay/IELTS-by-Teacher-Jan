import sys

with open("src/pages/FebruaryListeningTest.tsx", "r") as f:
    content = f.read()

old_mcq = """<label key={val} className={`mcq-label ${answers[item.q] === val ? "selected" : ""}`}><input type="radio" name={`q${item.q}`} value={val} checked={answers[item.q] === val} onChange={(e) => handleAnswerChange(item.q, e.target.value)} className="mcq-radio mt-1 mr-3" /> <span className="font-bold font-sans mr-3 shrink-0">{val}.</span> <span className="font-serif">{label}</span></label>"""
new_mcq = """<label key={val} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${answers[item.q] === val ? "border-[#1E4DB7] bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`}><input type="radio" name={`q${item.q}`} value={val} checked={answers[item.q] === val} onChange={(e) => handleAnswerChange(item.q, e.target.value)} className="w-5 h-5 mr-4 text-[#1E4DB7] focus:ring-[#1E4DB7]" /> <span className="font-bold mr-3">{val}</span> <span>{label}</span></label>"""

content = content.replace(old_mcq, new_mcq)

with open("src/pages/FebruaryListeningTest.tsx", "w") as f:
    f.write(content)
