const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerWritingTest.tsx', 'utf8');

const targetState = `    const [state, setState] = useState({
        studentName: user?.displayName || "",
        candidateNumber: "",
        examStarted: false,
        testStartTime: 0,
        submitTime: 0,
        isSubmitted: false,
        textPart1: "",
        textPart2: "",
        activePart: 1,
        textSize: 16,
        reviewState: { 1: false, 2: false } as Record<number, boolean>
    });
    
    const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
    const [saveStatus, setSaveStatus] = useState("Saved");
    const [showSettings, setShowSettings] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);`;

const replaceState = `    const [state, setState] = useState({
        studentName: user?.displayName || "",
        candidateNumber: "",
        examStarted: false,
        testMode: 'practice' as 'practice' | 'mock',
        testStartTime: 0,
        submitTime: 0,
        isSubmitted: false,
        textPart1: "",
        textPart2: "",
        activePart: 1,
        textSize: 16,
        reviewState: { 1: false, 2: false } as Record<number, boolean>
    });
    
    const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
    const [isTimePaused, setIsTimePaused] = useState(false);
    const [saveStatus, setSaveStatus] = useState("Saved");
    const [showSettings, setShowSettings] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);`;

if(code.includes(targetState)) {
    code = code.replace(targetState, replaceState);
    
    const targetStart = `    const handleStartTest = (name: string, number: string) => {
        const startTime = Date.now();
        setState(prev => ({
            ...prev,
            studentName: name,
            candidateNumber: number,
            examStarted: true,
            testStartTime: startTime
        }));
        setTimeLeft(TEST_DURATION);
    };`;
    const replaceStart = `    const handleStartTest = (name: string, number: string, testMode: 'practice' | 'mock' = 'practice') => {
        const startTime = Date.now();
        setState(prev => ({
            ...prev,
            studentName: name,
            candidateNumber: number,
            examStarted: true,
            testMode: testMode,
            testStartTime: startTime
        }));
        setTimeLeft(TEST_DURATION);
    };`;
    code = code.replace(targetStart, replaceStart);

    const targetInterval = `    useEffect(() => {
        if (!state.examStarted || state.isSubmitted) return;
        
        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - state.testStartTime) / 1000);
            const remaining = Math.max(0, TEST_DURATION - elapsed);
            setTimeLeft(remaining);
            
            if (remaining <= 0) {
                handleConfirmSubmit();
            }
        }, 1000);
        
        return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.examStarted, state.isSubmitted, state.testStartTime]);`;

    const replaceInterval = `    useEffect(() => {
        if (!state.examStarted || state.isSubmitted || isTimePaused) return;
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const remaining = prev - 1;
                if (remaining <= 0) {
                    clearInterval(timer);
                    handleConfirmSubmit();
                    return 0;
                }
                return remaining;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.examStarted, state.isSubmitted, isTimePaused]);`;

    code = code.replace(targetInterval, replaceInterval);

    fs.writeFileSync('src/pages/ComputerWritingTest.tsx', code);
    console.log("State and interval updated.");
} else {
    console.log("Could not find targetState");
}
