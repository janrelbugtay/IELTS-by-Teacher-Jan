import sys

with open("src/pages/MarchListeningTest.tsx", "r") as f:
    content = f.read()

old_mcq = """<label key={opt} className={`mcq-label ${answers[q.qNum] === opt ? "selected" : ""}`}>
                                            <input type="radio" name={`q${q.qNum}`} value={opt} className="mcq-radio" checked={answers[q.qNum] === opt} onChange={() => handleAnswerChange(q.qNum, opt)} disabled={isSubmitted} /> 
                                            <span className="font-bold font-sans mr-3 shrink-0">{opt}.</span> <span className="font-serif">{q.options[opt as keyof typeof q.options]}</span>
                                        </label>"""
new_mcq = """<label key={opt} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${answers[q.qNum] === opt ? "border-[#1E4DB7] bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`}>
                                            <input type="radio" name={`q${q.qNum}`} value={opt} className="w-5 h-5 mr-4 text-[#1E4DB7] focus:ring-[#1E4DB7]" checked={answers[q.qNum] === opt} onChange={() => handleAnswerChange(q.qNum, opt)} disabled={isSubmitted} /> 
                                            <span className="font-bold mr-3">{opt}</span> <span>{q.options[opt as keyof typeof q.options]}</span>
                                        </label>"""

content = content.replace(old_mcq, new_mcq)

with open("src/pages/MarchListeningTest.tsx", "w") as f:
    f.write(content)
