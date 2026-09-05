import re

filepath = 'src/pages/ComputerWritingTest.tsx'
with open(filepath, 'r') as f:
    content = f.read()

bad = """            {showSubmitModal && (
                <SubmitModal 
                    onCancel={() => setShowSubmitModal(false)}
                    onConfirm={handleConfirmSubmit}
                />
            )}"""

good = """            {showSubmitModal && (
                <SubmitModal 
                    onCancel={() => setShowSubmitModal(false)}
                    onConfirm={handleConfirmSubmit}
                    typeLabel={typeLabel}
                />
            )}"""

if bad in content:
    content = content.replace(bad, good)
    with open(filepath, 'w') as f:
        f.write(content)
    print("Fixed SubmitModal invocation")
else:
    print("Could not find SubmitModal invocation")

