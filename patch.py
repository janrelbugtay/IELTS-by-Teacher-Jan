import re

# Patch 1: CourseDetails.tsx
filepath = 'src/pages/CourseDetails.tsx'
with open(filepath, 'r') as f:
    content = f.read()

content = content.replace('Start Test <ArrowRight', 'Start <ArrowRight')

with open(filepath, 'w') as f:
    f.write(content)

# Patch 2: ComputerWritingTest.tsx
filepath = 'src/pages/ComputerWritingTest.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Remove redundant text
bad_redundant = """                    <p className="font-bold mb-8">{prompt.t2Desc}</p>
                    <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-100">
                        Give reasons for your answer and include any relevant examples from your own knowledge or experience.
                    </p>"""

good_redundant = """                    <p className="font-bold mb-8 text-gray-700">{prompt.t2Desc}</p>"""

content = content.replace(bad_redundant, good_redundant)

# Fix LoginScreen Start button
content = content.replace('Start Writing {typeLabel}', 'Start')

# Fix Header typeLabel prop passing
bad_header_call = """            <Header 
                studentName={state.studentName}
                candidateNumber={state.candidateNumber}
                timeLeft={timeLeft}
                saveStatus={saveStatus}
                onOpenSettings={() => setShowSettings(true)}
                onOpenSubmit={() => setShowSubmitModal(true)}
                isSubmitted={state.isSubmitted}
                testMode={state.testMode}
                isTimePaused={isTimePaused}
                onTogglePause={() => setIsTimePaused(!isTimePaused)}
            />"""

good_header_call = """            <Header 
                studentName={state.studentName}
                candidateNumber={state.candidateNumber}
                timeLeft={timeLeft}
                saveStatus={saveStatus}
                onOpenSettings={() => setShowSettings(true)}
                onOpenSubmit={() => setShowSubmitModal(true)}
                isSubmitted={state.isSubmitted}
                testMode={state.testMode}
                isTimePaused={isTimePaused}
                onTogglePause={() => setIsTimePaused(!isTimePaused)}
                typeLabel={typeLabel}
            />"""

content = content.replace(bad_header_call, good_header_call)

with open(filepath, 'w') as f:
    f.write(content)

print("Patched.")
