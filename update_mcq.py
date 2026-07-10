import sys

with open("src/pages/AprilListeningTest.tsx", "r") as f:
    content = f.read()

old_mcq_1 = """                          ].map(q => (
                             <div key={q.qNum}>
                                <div className="font-bold mb-3 flex"><span className="w-8 shrink-0">{q.qNum}</span><span>{q.text}</span></div>
                                <div className="pl-8 space-y-1">
                                    {['A', 'B', 'C'].map(opt => (
                                        <label key={opt} className={`mcq-label ${answers[q.qNum] === opt ? "selected" : ""}`}>
                                            <input type="radio" name={`q${q.qNum}`} value={opt} className="mcq-radio" checked={answers[q.qNum] === opt} onChange={() => handleAnswerChange(q.qNum, opt)} disabled={isSubmitted} /> 
                                            <span className="font-bold font-sans mr-3 shrink-0">{opt}</span> <span className="font-serif">{q.options[opt as keyof typeof q.options]}</span>
                                        </label>
                                    ))}
                                </div>
                             </div>
                          ))}"""

new_mcq_1 = """                          ].map(q => (
                             <div key={q.qNum} className="mb-8">
                                <div className="font-bold mb-4 flex text-[16px]"><span className="w-8 shrink-0">{q.qNum}</span><span>{q.text}</span></div>
                                <div className="pl-8 space-y-3">
                                    {['A', 'B', 'C'].map(opt => (
                                        <label key={opt} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${answers[q.qNum] === opt ? "border-[#1E4DB7] bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`}>
                                            <input type="radio" name={`q${q.qNum}`} value={opt} className="w-5 h-5 mr-4 text-[#1E4DB7] focus:ring-[#1E4DB7]" checked={answers[q.qNum] === opt} onChange={() => handleAnswerChange(q.qNum, opt)} disabled={isSubmitted} /> 
                                            <span className="font-bold mr-3">{opt}</span> <span>{q.options[opt as keyof typeof q.options]}</span>
                                        </label>
                                    ))}
                                </div>
                             </div>
                          ))}"""

content = content.replace(old_mcq_1, new_mcq_1)

with open("src/pages/AprilListeningTest.tsx", "w") as f:
    f.write(content)
