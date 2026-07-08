const fs = require('fs');

const orig = fs.readFileSync('src/pages/ComputerWritingTest.tsx', 'utf-8');
const headerComponents = orig.substring(0, orig.indexOf('export const ComputerWritingTest'));

const customComponent = `
import { setDoc } from 'firebase/firestore';
import { Settings } from 'lucide-react';

export const WritingHomework = ({ submissionId }: { submissionId?: string }) => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    
    const [state, setState] = useState({
        studentName: user?.displayName || "",
        candidateNumber: "",
        examStarted: false,
        testStartTime: 0,
        submitTime: 0,
        textPart1: "",
        textPart2: "",
        activePart: 1,
        textSize: 16,
        isSubmitted: false,
        reviewState: false,
        aiFeedback: null as string | null,
    });
    
    const [saveStatus, setSaveStatus] = useState("Saved");
    const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
    const [showSettings, setShowSettings] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);
    
    const [homeworkConfig, setHomeworkConfig] = useState<any>(null);
    const [isEditingConfig, setIsEditingConfig] = useState(false);
    const [configForm, setConfigForm] = useState({
        task1Prompt: "",
        task1Image: "",
        task2Prompt: "",
        task2Image: ""
    });

    useEffect(() => {
        const fetchHomeworkConfig = async () => {
            if (!courseId) return;
            const docRef = doc(db, 'homework_configs', \`\${courseId}_writing\`);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setHomeworkConfig(data);
                setConfigForm({
                    task1Prompt: data.task1Prompt || "",
                    task1Image: data.task1Image || "",
                    task2Prompt: data.task2Prompt || "",
                    task2Image: data.task2Image || ""
                });
            } else {
                setHomeworkConfig(null);
            }
        };
        fetchHomeworkConfig();
    }, [courseId]);

    const handleSaveConfig = async () => {
        if (!courseId) return;
        try {
            await setDoc(doc(db, 'homework_configs', \`\${courseId}_writing\`), configForm);
            setHomeworkConfig(configForm);
            setIsEditingConfig(false);
            alert("Homework configuration saved successfully!");
        } catch (error) {
            console.error("Error saving homework config:", error);
            alert("Failed to save configuration.");
        }
    };

    useEffect(() => {
        if (!state.examStarted || state.isSubmitted) return;
        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - state.testStartTime) / 1000);
            const remaining = Math.max(0, TEST_DURATION - elapsed);
            setTimeLeft(remaining);
            if (remaining <= 0) handleConfirmSubmit();
        }, 1000);
        return () => clearInterval(timer);
    }, [state.examStarted, state.isSubmitted, state.testStartTime]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (state.examStarted && !state.isSubmitted) {
                const msg = "Your IELTS writing homework is still in progress.";
                e.preventDefault();
                e.returnValue = msg;
                return msg;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [state.examStarted, state.isSubmitted]);

    const handleStartTest = (name: string, number: string) => {
        const startTime = Date.now();
        setState(prev => ({
            ...prev,
            studentName: name,
            candidateNumber: number,
            examStarted: true,
            testStartTime: startTime
        }));
        setTimeLeft(TEST_DURATION);
    };

    const updateState = (updates: any) => {
        setState(prev => ({ ...prev, ...updates }));
        setSaveStatus("Saving...");
        setTimeout(() => setSaveStatus("Saved"), 1000);
    };

    const handleTextChange = (part: number, text: string) => updateState(part === 1 ? { textPart1: text } : { textPart2: text });
    const toggleReview = () => updateState({ reviewState: !state.reviewState });

    const handleConfirmSubmit = async () => {
        setShowSubmitModal(false);
        updateState({ isSubmitted: true, submitTime: Date.now() });

        if (!user || !courseId) return;

        try {
            const refId = doc(collection(db, 'submissions')).id;
            await setDoc(doc(db, 'submissions', refId), {
                assignmentId: \`\${courseId}_writing_homework\`,
                assignmentTitle: \`\${courseId.toUpperCase()} Writing Homework\`,
                studentId: user.uid,
                studentName: state.studentName,
                submittedAt: serverTimestamp(),
                timeSpent: TEST_DURATION - timeLeft,
                answers: {
                    task1: state.textPart1,
                    task2: state.textPart2
                },
                status: 'pending',
                type: 'writing'
            });
            alert("Homework submitted successfully!");
            navigate(\`/ielts/dashboard\`);
        } catch (error) {
            console.error("Error submitting homework:", error);
            alert("There was an error submitting your homework.");
        }
    };

    if (isEditingConfig && isAdmin) {
        return (
            <div className="p-8 max-w-4xl mx-auto font-sans">
                <h1 className="text-2xl font-bold mb-6 text-slate-800">Setup Writing Homework for {courseId?.toUpperCase()}</h1>
                
                <div className="space-y-6 bg-white p-6 rounded-xl shadow border border-slate-200">
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-slate-800">Task 1</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL (Google Drive etc.)</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={configForm.task1Image}
                                onChange={e => setConfigForm({...configForm, task1Image: e.target.value})}
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Prompt / Question</label>
                            <textarea 
                                className="w-full border border-slate-300 rounded p-2 h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={configForm.task1Prompt}
                                onChange={e => setConfigForm({...configForm, task1Prompt: e.target.value})}
                                placeholder="The chart below gives information about..."
                            />
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h2 className="text-xl font-bold mb-4 text-slate-800">Task 2</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Image URL (Optional)</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={configForm.task2Image}
                                onChange={e => setConfigForm({...configForm, task2Image: e.target.value})}
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Prompt / Question</label>
                            <textarea 
                                className="w-full border border-slate-300 rounded p-2 h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={configForm.task2Prompt}
                                onChange={e => setConfigForm({...configForm, task2Prompt: e.target.value})}
                                placeholder="Some people think that universities should provide..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <button 
                            onClick={() => setIsEditingConfig(false)}
                            className="px-4 py-2 border border-slate-300 text-slate-700 rounded font-bold hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSaveConfig}
                            className="px-4 py-2 bg-[#2563EB] text-white rounded font-bold hover:bg-blue-700"
                        >
                            Save Homework Configuration
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!state.examStarted && !state.isSubmitted) {
        return (
            <div className="relative h-screen bg-[#d2d6de]">
                {isAdmin && (
                    <button 
                        onClick={() => setIsEditingConfig(true)}
                        className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow font-bold flex items-center gap-2 hover:bg-slate-50 z-10 text-slate-800"
                    >
                        <Settings className="w-4 h-4" /> Edit Homework Setup
                    </button>
                )}
                {!homeworkConfig && !isAdmin ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
                            <h2 className="text-xl font-bold mb-2 text-slate-800">No active homework</h2>
                            <p className="text-slate-500 mb-6 font-medium">Your teacher has not set up a writing homework for this course yet.</p>
                            <button onClick={() => navigate('/ielts/dashboard')} className="px-6 py-2 bg-[#2563EB] text-white font-bold rounded-lg hover:bg-blue-700">Go Back</button>
                        </div>
                    </div>
                ) : (
                    <LoginScreen onStart={handleStartTest} initialName={user?.displayName || ""} />
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-200 overflow-hidden font-sans">
            <Header 
                studentName={state.studentName}
                candidateNumber={state.candidateNumber}
                timeLeft={timeLeft}
                saveStatus={saveStatus}
                onOpenSettings={() => setShowSettings(true)}
                onOpenSubmit={() => setShowSubmitModal(true)}
                isSubmitted={state.isSubmitted}
            />
            
            <div className="flex-1 flex flex-col min-h-0 bg-white m-1 md:m-2 rounded-lg shadow-sm border border-slate-300 overflow-hidden">
                <div className="px-8 py-5 bg-[#f8fafc] border-b border-gray-200 flex-none">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Part {state.activePart}</h2>
                    <p className="text-[15px] text-gray-600 font-medium">
                        You should spend about {state.activePart === 1 ? "20" : "40"} minutes on this task. 
                        Write at least {state.activePart === 1 ? "150" : "250"} words.
                    </p>
                </div>
                
                <div className="flex-1 flex flex-col md:flex-row bg-[#f1f5f9] p-4 gap-4 overflow-hidden min-h-0">
                    <div className="flex-1 bg-white border border-gray-200 p-8 overflow-y-auto shadow-inner md:rounded-l-md" style={{ fontSize: \`\${state.textSize}px\` }}>
                        <div className="text-gray-800 leading-relaxed animate-in fade-in">
                            {state.activePart === 1 ? (
                                <>
                                    <div className="whitespace-pre-wrap font-medium mb-6">
                                        {homeworkConfig?.task1Prompt || "Task 1 Prompt not set."}
                                    </div>
                                    {homeworkConfig?.task1Image && (
                                        <div className="mt-4 border rounded-lg p-2 bg-gray-50 flex justify-center">
                                            <img src={homeworkConfig.task1Image} alt="Task 1" className="max-w-full h-auto max-h-[400px] object-contain" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="whitespace-pre-wrap font-medium mb-6">
                                        {homeworkConfig?.task2Prompt || "Task 2 Prompt not set."}
                                    </div>
                                    {homeworkConfig?.task2Image && (
                                        <div className="mt-4 border rounded-lg p-2 bg-gray-50 flex justify-center">
                                            <img src={homeworkConfig.task2Image} alt="Task 2" className="max-w-full h-auto max-h-[400px] object-contain" />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    
                    <WritingEditor 
                        text={state.activePart === 1 ? state.textPart1 : state.textPart2}
                        onTextChange={(t: string) => handleTextChange(state.activePart, t)}
                        textSize={state.textSize}
                        minWords={state.activePart === 1 ? 150 : 250}
                        isActive={true}
                        isSubmitted={state.isSubmitted}
                        testStartTime={state.testStartTime}
                    />
                </div>
            </div>
            
            <FooterNavigation 
                activePart={state.activePart}
                setActivePart={(p: number) => updateState({ activePart: p })}
                words1={wordCount(state.textPart1)}
                words2={wordCount(state.textPart2)}
                reviewState={state.reviewState}
                toggleReview={toggleReview}
            />
            
            {showSettings && (
                <SettingsModal 
                    textSize={state.textSize} 
                    setTextSize={(size: number) => updateState({ textSize: size })}
                    onClose={() => setShowSettings(false)}
                />
            )}
            
            {showSubmitModal && (
                <SubmitModal 
                    onConfirm={handleConfirmSubmit} 
                    onCancel={() => setShowSubmitModal(false)} 
                />
            )}
        </div>
    );
};
`;

const finalFile = headerComponents + '\n' + customComponent;
fs.writeFileSync('src/pages/WritingHomework.tsx', finalFile);
