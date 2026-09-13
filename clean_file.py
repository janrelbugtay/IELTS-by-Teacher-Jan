with open('src/pages/Homework1WritingTest.tsx', 'r') as f:
    content = f.read()

bad_block1 = """    useEffect(() => {
        if (publishConfig && !publishConfig.part1 && publishConfig.part2) {
            setCurrentPart(2);
        } else if (publishConfig && publishConfig.part1 && !publishConfig.part2) {
            setCurrentPart(1);
        }
    }, [publishConfig]);\n"""

bad_block2 = """    useEffect(() => {
        if (publishConfig && !publishConfig.part1 && publishConfig.part2 && currentPart === 1) {
            setCurrentPart(2);
        } else if (publishConfig && publishConfig.part1 && !publishConfig.part2 && currentPart === 2) {
            setCurrentPart(1);
        }
    }, [publishConfig]);\n"""

while bad_block1 in content:
    content = content.replace(bad_block1, '')
    
while bad_block2 in content:
    content = content.replace(bad_block2, '')

# Now re-insert the good block in one place only.
good_block = """    useEffect(() => {
        const fetchConfig = async () => {
            const docRef = doc(db, "homeworkConfig", "ielts-writing-homework-1");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPublishConfig(docSnap.data() as any);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        if (publishConfig && !publishConfig.part1 && publishConfig.part2 && currentPart === 1) {
            setCurrentPart(2);
        } else if (publishConfig && publishConfig.part1 && !publishConfig.part2 && currentPart === 2) {
            setCurrentPart(1);
        }
    }, [publishConfig]);"""

content = content.replace('''    useEffect(() => {
        const fetchConfig = async () => {
            const docRef = doc(db, "homeworkConfig", "ielts-writing-homework-1");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setPublishConfig(docSnap.data() as any);
            }
        };
        fetchConfig();
    }, []);''', good_block)

with open('src/pages/Homework1WritingTest.tsx', 'w') as f:
    f.write(content)
