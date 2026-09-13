import re

with open('src/pages/Homework1WritingTest.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if line.strip() == 'useEffect(() => {' and lines[i+1].strip() == 'useEffect(() => {' and lines[i+2].strip() == 'const fetchConfig = async () => {':
        new_lines.extend([
            '    useEffect(() => {\n',
            '        const fetchConfig = async () => {\n',
            '            const docRef = doc(db, "homeworkConfig", "ielts-writing-homework-1");\n',
            '            const docSnap = await getDoc(docRef);\n',
            '            if (docSnap.exists()) {\n',
            '                setPublishConfig(docSnap.data() as any);\n',
            '            }\n',
            '        };\n',
            '        fetchConfig();\n',
            '    }, []);\n',
            '\n',
            '    useEffect(() => {\n',
            '        text1Ref.current = text1;\n',
            '        text2Ref.current = text2;\n',
            '        candidateNameRef.current = candidateName;\n',
            '    }, [text1, text2, candidateName]);\n'
        ])
        # Need to skip until we reach '    }, [text1, text2, candidateName]);'
        skip = True
        continue
        
    if skip:
        if '}, [text1, text2, candidateName]);' in line:
            skip = False
        continue
        
    new_lines.append(line)

with open('src/pages/Homework1WritingTest.tsx', 'w') as f:
    f.writelines(new_lines)
