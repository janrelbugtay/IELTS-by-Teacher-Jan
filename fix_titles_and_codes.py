import os
import re

months = ["January", "February", "March", "April", "May", "June", "July"]
codes = {
    "January": "1492",
    "February": "2841",
    "March": "3756",
    "April": "4183",
    "May": "5924",
    "June": "6319",
    "July": "7295"
}

for month in months:
    filename = f"src/pages/{month}ListeningTest.tsx"
    if not os.path.exists(filename):
        continue
    
    with open(filename, "r") as f:
        content = f.read()

    # 1. Change title
    content = content.replace("IELTS Listening Test</h1>", f"{month} IELTS Listening Test</h1>")
    content = content.replace("IELTS Listening Test -", f"{month} IELTS Listening Test -") # in case there's another occurrence

    # 2. Change expectedCandidateNumber
    expected_number = f"{month[:3].upper()}2026"
    new_code = codes[month]
    
    content = content.replace(f"const expectedCandidateNumber = '{expected_number}';", f"const expectedCandidateNumber = '{new_code}';")

    with open(filename, "w") as f:
        f.write(content)
    print(f"Updated {filename}")

