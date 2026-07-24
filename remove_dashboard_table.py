import re

with open("src/pages/AdminDashboard.tsx", "r") as f:
    content = f.read()

# Remove the Listening Test Candidate Numbers section
content = re.sub(r'\{/\* Listening Test Candidate Numbers \*/\}.*?\{/\* User Tracking System \*/\}', '{/* User Tracking System */}', content, flags=re.DOTALL)

with open("src/pages/AdminDashboard.tsx", "w") as f:
    f.write(content)
print("Updated AdminDashboard")
