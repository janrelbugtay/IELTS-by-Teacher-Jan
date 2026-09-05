import re

filepath = 'src/pages/ComputerWritingTest.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add typeLabel prop to LoginScreen
content = content.replace("const LoginScreen = ({ onStart, initialName, testTitle }: {", "const LoginScreen = ({ onStart, initialName, testTitle, typeLabel }: {")
content = content.replace("testTitle }: {", "testTitle, typeLabel }: {")
content = content.replace("Start Writing Test", "Start Writing {typeLabel}")

# Add typeLabel prop to SubmitModal
content = content.replace("const SubmitModal = ({ onConfirm, onCancel }: any) => (", "const SubmitModal = ({ onConfirm, onCancel, typeLabel = 'Test' }: any) => (")
content = content.replace("Submit Test</h3>", "Submit {typeLabel}</h3>")
content = content.replace("your IELTS Writing test?", "your IELTS Writing {typeLabel.toLowerCase()}?")

# Add typeLabel prop to Header
content = content.replace("const Header = ({ studentName, candidateNumber, timeLeft, saveStatus, onOpenSettings, onOpenSubmit, isSubmitted, testMode, isTimePaused, onTogglePause }: any) => {", "const Header = ({ studentName, candidateNumber, timeLeft, saveStatus, onOpenSettings, onOpenSubmit, isSubmitted, testMode, isTimePaused, onTogglePause, typeLabel = 'Test' }: any) => {")
content = content.replace('isSubmitted ? "Test Completed" : formatTime(timeLeft)', 'isSubmitted ? `${typeLabel} Completed` : formatTime(timeLeft)')
content = content.replace(">Submit Test<", ">{`Submit ${typeLabel}`}<")
content = content.replace('Submit Test', '{`Submit ${typeLabel}`}')

# Inject typeLabel into main component
if "const typeLabel =" not in content:
    content = content.replace("let testTitle = 'IELTS Writing Test';", "const typeLabel = testId?.toLowerCase().includes('homework') ? 'Homework' : 'Test';\n    let testTitle = `IELTS Writing ${typeLabel}`;")

# Pass typeLabel to LoginScreen
content = content.replace("<LoginScreen onStart={handleStartTest} initialName={state.studentName} testTitle={testTitle} />", "<LoginScreen onStart={handleStartTest} initialName={state.studentName} testTitle={testTitle} typeLabel={typeLabel} />")

# Pass typeLabel to SubmitModal
content = content.replace("<SubmitModal onConfirm={handleConfirmSubmit} onCancel={() => setShowSubmitModal(false)} />", "<SubmitModal onConfirm={handleConfirmSubmit} onCancel={() => setShowSubmitModal(false)} typeLabel={typeLabel} />")

# Pass typeLabel to Header
content = content.replace("isTimePaused={isTimePaused} onTogglePause={handleTogglePause}", "isTimePaused={isTimePaused} onTogglePause={handleTogglePause} typeLabel={typeLabel}")

# Other places
content = content.replace('Test Submitted Successfully', '{typeLabel} Submitted Successfully')
content = content.replace('Retake Test', 'Retake {typeLabel}')


with open(filepath, 'w') as f:
    f.write(content)

