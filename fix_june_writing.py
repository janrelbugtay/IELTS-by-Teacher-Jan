with open('src/pages/JuneWritingTest.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "WRITING TASK 2" in line:
        for j in range(i, i+15):
            if "Coming soon" in lines[j]:
                lines[j] = "                                        Some people believe that sports competitions are a source of emotional stress for young people. Therefore, youth should be banned from participating in sports competitions.<br/><br/>\n                                        Do you agree or disagree?\n"
                break
        break

with open('src/pages/JuneWritingTest.tsx', 'w') as f:
    f.writelines(lines)
