import re

filepath = 'src/pages/ComputerWritingTest.tsx'
with open(filepath, 'r') as f:
    content = f.read()

bad_footer_decl = "const FooterNavigation = ({ activePart, setActivePart, words1, words2, reviewState, toggleReview }: any) => {"
good_footer_decl = "const FooterNavigation = ({ activePart, setActivePart, words1, words2, reviewState, toggleReview, publishConfig }: any) => {"

content = content.replace(bad_footer_decl, good_footer_decl)

bad_footer_parts = """                <div className="flex items-center gap-6 text-sm font-bold text-gray-700">
                    <div className="flex items-center cursor-pointer group hover:opacity-80 transition-opacity" onClick={() => setActivePart(1)}>
                        Part 1 
                        <span className={`w-6 h-6 flex items-center justify-center text-[13px] font-bold ml-1.5 rounded transition-all ${getNavClass(1, isP1Done)}`}>1</span>
                    </div>
                    <div className="flex items-center cursor-pointer group hover:opacity-80 transition-opacity" onClick={() => setActivePart(2)}>
                        Part 2 
                        <span className={`w-6 h-6 flex items-center justify-center text-[13px] font-bold ml-1.5 rounded transition-all ${getNavClass(2, isP2Done)}`}>2</span>
                    </div>
                </div>"""

good_footer_parts = """                <div className="flex items-center gap-6 text-sm font-bold text-gray-700">
                    {publishConfig?.part1 !== false && (
                        <div className="flex items-center cursor-pointer group hover:opacity-80 transition-opacity" onClick={() => setActivePart(1)}>
                            Part 1 
                            <span className={`w-6 h-6 flex items-center justify-center text-[13px] font-bold ml-1.5 rounded transition-all ${getNavClass(1, isP1Done)}`}>1</span>
                        </div>
                    )}
                    {publishConfig?.part2 !== false && (
                        <div className="flex items-center cursor-pointer group hover:opacity-80 transition-opacity" onClick={() => setActivePart(2)}>
                            Part 2 
                            <span className={`w-6 h-6 flex items-center justify-center text-[13px] font-bold ml-1.5 rounded transition-all ${getNavClass(2, isP2Done)}`}>2</span>
                        </div>
                    )}
                </div>"""

content = content.replace(bad_footer_parts, good_footer_parts)

# Fix toggler
bad_toggler = """                <button 
                    className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 hover:shadow transition-all active:scale-95"
                    onClick={() => setActivePart(activePart === 1 ? 2 : 1)}
                >"""

good_toggler = """                {(publishConfig?.part1 !== false && publishConfig?.part2 !== false) && <button 
                    className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 hover:shadow transition-all active:scale-95"
                    onClick={() => setActivePart(activePart === 1 ? 2 : 1)}
                >"""

content = content.replace(bad_toggler, good_toggler + "\n                    <svg className=\"w-5 h-5 text-gray-600\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2.5\" viewBox=\"0 0 24 24\">\n                        <path strokeLinecap=\"round\" strokeLinejoin=\"round\" d=\"M9 5l7 7-7 7\"></path>\n                    </svg>\n                </button>}")

bad_svg = """                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
            </div>"""

content = content.replace(bad_svg, "            </div>")


# Now add publishConfig state and effect
state_def = """    const [state, setState] = useState({"""
good_state_def = """    const [publishConfig, setPublishConfig] = useState({ part1: true, part2: true });

    useEffect(() => {
        if (typeLabel === 'Homework' && testId) {
            const fetchConfig = async () => {
                const docRef = doc(db, 'homeworkConfig', testId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPublishConfig(docSnap.data() as any);
                }
            };
            fetchConfig();
        }
    }, [testId, typeLabel]);

    useEffect(() => {
        if (typeLabel === 'Homework') {
            setState(prev => {
                if (!publishConfig.part1 && publishConfig.part2 && prev.activePart === 1) {
                    return { ...prev, activePart: 2 };
                }
                if (publishConfig.part1 && !publishConfig.part2 && prev.activePart === 2) {
                    return { ...prev, activePart: 1 };
                }
                return prev;
            });
        }
    }, [publishConfig, typeLabel]);

    const handleTogglePublish = async (part: 'part1' | 'part2') => {
        const newConfig = { ...publishConfig, [part]: !publishConfig[part] };
        setPublishConfig(newConfig);
        if (testId) {
            const docRef = doc(db, 'homeworkConfig', testId);
            await setDoc(docRef, newConfig, { merge: true });
        }
    };

    const [state, setState] = useState({"""

content = content.replace(state_def, good_state_def)

# Add admin controls at the top of the test
bad_top = """                <div className="px-8 py-5 bg-[#f8fafc] border-b border-gray-200 flex-none">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Part {state.activePart}</h2>"""

good_top = """                {isAdmin && typeLabel === 'Homework' && (
                    <div className="bg-yellow-100 border-b border-yellow-300 p-3 px-8 flex justify-between items-center text-sm font-semibold text-yellow-800">
                        <div className="flex items-center gap-2">
                            <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs">ADMIN</span>
                            Publish/Unpublish Parts for Homework
                        </div>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                                <input 
                                    type="checkbox" 
                                    checked={publishConfig.part1} 
                                    onChange={() => handleTogglePublish('part1')}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                                />
                                Part 1 Published
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                                <input 
                                    type="checkbox" 
                                    checked={publishConfig.part2} 
                                    onChange={() => handleTogglePublish('part2')}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                                />
                                Part 2 Published
                            </label>
                        </div>
                    </div>
                )}
                <div className="px-8 py-5 bg-[#f8fafc] border-b border-gray-200 flex-none">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Part {state.activePart}</h2>"""

content = content.replace(bad_top, good_top)

# Update FooterNavigation passing
bad_footer_call = """            <FooterNavigation 
                activePart={state.activePart}
                setActivePart={(p: number) => updateState({ activePart: p })}
                words1={wordCount(state.textPart1)}
                words2={wordCount(state.textPart2)}
                reviewState={state.reviewState}
                toggleReview={toggleReview}
            />"""

good_footer_call = """            <FooterNavigation 
                activePart={state.activePart}
                setActivePart={(p: number) => updateState({ activePart: p })}
                words1={wordCount(state.textPart1)}
                words2={wordCount(state.textPart2)}
                reviewState={state.reviewState}
                toggleReview={toggleReview}
                publishConfig={publishConfig}
            />"""

content = content.replace(bad_footer_call, good_footer_call)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated script.")
