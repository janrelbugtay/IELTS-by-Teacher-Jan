import re

with open('src/pages/ComputerWritingTest.tsx', 'r') as f:
    content = f.read()

# Replace handleGenerateReport
old_handle = """    const handleGenerateReport = async () => {
        setIsEvaluating(true);
        let finalFeedback = "";
        let finalBandScore = 0;

        try {
            const textToEvaluate = state.textPart2.trim() || state.textPart1.trim();
            const response = await fetch('/api/evaluate-writing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputText: textToEvaluate, taskType: state.textPart2.trim() ? 'task2' : 'task1', rawPrompt: state.textPart2.trim() ? getCustomPrompt(id).t2Raw : getCustomPrompt(id).t1Raw })
            });
            if (!response.ok) {
                let errText = await response.text();
                try {
                    const parsedErr = JSON.parse(errText);
                    if (parsedErr.error) errText = parsedErr.error;
                } catch(e) {}
                throw new Error(`Evaluation failed: ${errText}`);
            }
            const result = await response.json();
            if (response.ok && result.feedback) {
                finalFeedback = result.feedback;
                const bandMatch = finalFeedback.match(/Final IELTS Band\s*=\s*([\d.]+)/i);
                finalBandScore = bandMatch ? parseFloat(bandMatch[1]) : 0;
            }

            setState(prev => ({
                ...prev,
                aiFeedback: finalFeedback,
                aiBandScore: finalBandScore
            }));

            if (submissionId) {
                const { updateDoc, doc } = await import('firebase/firestore');
                const docRef = doc(db, 'submissions', submissionId);
                await updateDoc(docRef, {
                    bandScore: finalBandScore,
                    aiFeedback: finalFeedback,
                    requiresEvaluation: false
                });
            } else if (id) {
                // local save
                const key = `${STORAGE_KEY}_${id}`;
                const saved = localStorage.getItem(key);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    parsed.aiFeedback = finalFeedback;
                    parsed.aiBandScore = finalBandScore;
                    localStorage.setItem(key, JSON.stringify(parsed));
                }
            }

        } catch (err: any) {
            console.error("AI Evaluation failed", err);
            alert(err?.message || "AI Evaluation failed. Please try again later.");
        } finally {
            setIsEvaluating(false);
        }
    };"""

new_handle = """    const handleGenerateReport = async () => {
        setIsEvaluating(true);
        try {
            const taskNum = state.activePart;
            const textToEvaluate = taskNum === 1 ? state.textPart1 : state.textPart2;
            const rawPrompt = taskNum === 1 ? getCustomPrompt(id).t1Raw : getCustomPrompt(id).t2Raw;
            
            if (!textToEvaluate.trim()) {
                alert(`Please write something for Task ${taskNum} before requesting feedback.`);
                setIsEvaluating(false);
                return;
            }

            const response = await fetch('/api/evaluate-writing-json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputText: textToEvaluate, taskType: taskNum.toString(), rawPrompt })
            });

            if (!response.ok) {
                let errText = await response.text();
                try {
                    const parsedErr = JSON.parse(errText);
                    if (parsedErr.error) errText = parsedErr.error;
                } catch(e) {}
                throw new Error(`Evaluation failed: ${errText}`);
            }

            const data = await response.json();
            
            // Generate markdown string for legacy compatibility or fallback
            const formatReport = (t: number, d: any) => `### Task ${t} Evaluation\\n**Overall Band Score:** ${d.scores?.overallBand}\\n\\n**Task Achievement / Response:** ${d.scores?.taskAchievement}\\n*${d.feedback?.taskAchievement}*\\n\\n**Coherence and Cohesion:** ${d.scores?.coherenceCohesion}\\n*${d.feedback?.coherenceCohesion}*\\n\\n**Lexical Resource:** ${d.scores?.lexicalResource}\\n*${d.feedback?.lexicalResource}*\\n\\n**Grammatical Range and Accuracy:** ${d.scores?.grammaticalRange}\\n*${d.feedback?.grammaticalRange}*\\n\\n#### Corrected Answer\\n${d.finalCorrectedAnswer || ''}\\n\\n#### Error Marking\\n${d.inlineMarkedEssay || ''}\\n`;
            
            const aiFeedbackMarkdown = formatReport(taskNum, data);
            const bandScore = parseFloat(data.scores?.overallBand) || 0;
            
            // get existing raw data if any
            let rawData: any = {};
            try {
                 if (state.aiFeedbackRaw) rawData = JSON.parse(state.aiFeedbackRaw);
            } catch(e) {}
            
            if (taskNum === 1) rawData.part1 = data;
            if (taskNum === 2) rawData.part2 = data;
            const newRawStr = JSON.stringify(rawData);

            setState(prev => ({
                ...prev,
                aiFeedback: aiFeedbackMarkdown,
                aiFeedbackRaw: newRawStr,
                aiBandScore: bandScore
            }));

            if (submissionId) {
                const { updateDoc, doc } = await import('firebase/firestore');
                const docRef = doc(db, 'submissions', submissionId);
                await updateDoc(docRef, {
                    bandScore: bandScore,
                    aiFeedback: aiFeedbackMarkdown,
                    aiFeedbackRaw: newRawStr,
                    requiresEvaluation: false
                });
            } else if (id) {
                const key = `${STORAGE_KEY}_${id}`;
                const saved = localStorage.getItem(key);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    parsed.aiFeedback = aiFeedbackMarkdown;
                    parsed.aiFeedbackRaw = newRawStr;
                    parsed.aiBandScore = bandScore;
                    localStorage.setItem(key, JSON.stringify(parsed));
                }
            }

        } catch (err: any) {
            console.error("AI Evaluation failed", err);
            alert(err?.message || "AI Evaluation failed. Please try again later.");
        } finally {
            setIsEvaluating(false);
        }
    };"""

content = content.replace(old_handle, new_handle)

# We also need to add aiFeedbackRaw to the initial state
state_search = """        aiFeedback: "",
        aiBandScore: 0
    });"""
state_replace = """        aiFeedback: "",
        aiFeedbackRaw: "",
        aiBandScore: 0
    });"""
content = content.replace(state_search, state_replace)

# And load it from submission
load_search = """                            aiFeedback: data.aiFeedback || '',
                            aiBandScore: data.bandScore || null
                        }));"""
load_replace = """                            aiFeedback: data.aiFeedback || '',
                            aiFeedbackRaw: data.aiFeedbackRaw || '',
                            aiBandScore: data.bandScore || null
                        }));"""
content = content.replace(load_search, load_replace)

with open('src/pages/ComputerWritingTest.tsx', 'w') as f:
    f.write(content)
