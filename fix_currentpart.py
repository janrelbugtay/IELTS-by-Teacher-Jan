with open('src/pages/Homework1WritingTest.tsx', 'r') as f:
    content = f.read()

content = content.replace('''    useEffect(() => {
        const fetchConfig = async () => {''', '''    useEffect(() => {
        if (publishConfig && !publishConfig.part1 && publishConfig.part2 && currentPart === 1) {
            setCurrentPart(2);
        } else if (publishConfig && publishConfig.part1 && !publishConfig.part2 && currentPart === 2) {
            setCurrentPart(1);
        }
    }, [publishConfig]);

    useEffect(() => {
        const fetchConfig = async () => {''')

with open('src/pages/Homework1WritingTest.tsx', 'w') as f:
    f.write(content)
