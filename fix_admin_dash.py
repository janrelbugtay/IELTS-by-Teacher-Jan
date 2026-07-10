import re

with open("src/pages/AdminDashboard.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "to={`/ielts/dashboard?userId=${u.uid || u.id}`}",
    "to={u.course === 'PET' ? `/pet/dashboard?userId=${u.uid || u.id}` : `/ielts/dashboard?userId=${u.uid || u.id}`}"
)

with open("src/pages/AdminDashboard.tsx", "w") as f:
    f.write(content)
