import re

with open("src/pages/pet/Dashboard.tsx", "r") as f:
    content = f.read()

old_state = "const [offlineForm, setOfflineForm] = useState({ name: '', link: '', score: '', correct: '', time: '', date: new Date().toISOString().split('T')[0] });"
new_state = "const [offlineForm, setOfflineForm] = useState({ name: '', link: '', score: '', correct: '', time: '', date: new Date().toISOString().split('T')[0], feedback: '' });\\n    const [viewFeedbackItem, setViewFeedbackItem] = useState<any>(null);"
content = content.replace(old_state, new_state)

with open("src/pages/pet/Dashboard.tsx", "w") as f:
    f.write(content)
