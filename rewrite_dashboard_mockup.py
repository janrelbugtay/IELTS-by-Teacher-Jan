import re

with open("src/pages/pet/Dashboard.tsx", "r") as f:
    content = f.read()

# Make the activities use props instead of hardcoded data inside them
content = content.replace("const SpeakingActivity = () => (", "const SpeakingActivity = ({ isAdmin, data, onDelete, onAddOffline }: any) => (")
content = content.replace("const TableActivity = ({ title, Icon, colorClass, data }: any) => (", "const TableActivity = ({ title, Icon, colorClass, data, isAdmin, onDelete, onAddOffline }: any) => (")
content = content.replace("const WritingActivity = () => (", "const WritingActivity = ({ isAdmin, data, onDelete, onAddOffline }: any) => (")

with open("src/pages/pet/Dashboard.tsx", "w") as f:
    f.write(content)
