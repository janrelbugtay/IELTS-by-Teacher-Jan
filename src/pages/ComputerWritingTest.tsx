import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { renderMarkdown } from '../lib/markdown';
import { Award, CheckCircle2 } from 'lucide-react';
import { EraLogo } from '../components/EraLogo';

import { JanuaryWritingTest } from './JanuaryWritingTest';
import { FebruaryWritingTest } from './FebruaryWritingTest';
import { MarchWritingTest } from './MarchWritingTest';
import { AprilWritingTest } from './AprilWritingTest';
import { MayWritingTest } from './MayWritingTest';
import { JuneWritingTest } from './JuneWritingTest';

const TEST_DURATION = 3600; // 60 minutes
const STORAGE_KEY = 'ielts_sim_data';

const wordCount = (text: string) => {
    const trimmed = text.trim();
    return trimmed === "" ? 0 : trimmed.split(/\s+/).filter(w => w.length > 0).length;
};

const charCount = (text: string) => text.length;
const paragraphCount = (text: string) => {
    const trimmed = text.trim();
    return trimmed === "" ? 0 : trimmed.split(/\n+/).filter(p => p.trim().length > 0).length;
};

const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Time's up";
    const mins = Math.ceil(seconds / 60);
    return `${mins} minutes left`;
};

const LoginScreen = ({ onStart, initialName }: { onStart: (name: string, number: string, testMode: 'practice' | 'mock') => void, initialName: string }) => {
    const [name, setName] = useState(initialName || "");
    const [number, setNumber] = useState("");
    const [testMode, setTestMode] = useState<'practice' | 'mock'>('practice');

    return (
        <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-[#e0e7ff] via-[#d2d6de] to-[#fbcfe8] relative overflow-hidden">
            <div className="absolute w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -top-10 -left-10 animate-blob"></div>
            <div className="absolute w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 top-40 right-20 animate-blob animation-delay-2000"></div>
            <div className="absolute w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 bottom-10 left-20 animate-blob animation-delay-4000"></div>
            
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 w-[500px] max-w-[90%] z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                    </div>
                </div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-2 text-center">IELTS Writing Test</h1>
                <p className="text-gray-500 text-center mb-8 text-sm font-medium">Please select your mode and enter your details to begin.</p>
                
                <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <button 
                            type="button"
                            onClick={() => setTestMode('practice')}
                            className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${testMode === 'practice' ? 'border-purple-500 bg-purple-50/80 shadow-md' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 bg-white/50'}`}
                        >
                            {testMode === 'practice' && <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>}
                            <div className="flex justify-between items-start mb-1">
                                <div className={`font-bold text-[15px] ${testMode === 'practice' ? 'text-purple-700' : 'text-gray-700'}`}>Study Mode</div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${testMode === 'practice' ? 'border-purple-500' : 'border-gray-300'}`}>
                                    {testMode === 'practice' && <div className="w-2 h-2 rounded-full bg-purple-500"></div>}
                                </div>
                            </div>
                            <div className="text-[11px] text-gray-500 leading-snug pr-2">
                                Timer can be paused. Ideal for learning and reviewing.
                            </div>
                        </button>

                        <button 
                            type="button"
                            onClick={() => setTestMode('mock')}
                            className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${testMode === 'mock' ? 'border-blue-500 bg-blue-50/80 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 bg-white/50'}`}
                        >
                            {testMode === 'mock' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                            <div className="flex justify-between items-start mb-1">
                                <div className={`font-bold text-[15px] ${testMode === 'mock' ? 'text-blue-700' : 'text-gray-700'}`}>Mock Test Mode</div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${testMode === 'mock' ? 'border-blue-500' : 'border-gray-300'}`}>
                                    {testMode === 'mock' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                </div>
                            </div>
                            <div className="text-[11px] text-gray-500 leading-snug pr-2">
                                Strict timed conditions. Timer cannot be paused.
                            </div>
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800 transition-all bg-white/80"
                            placeholder="e.g. John Smith"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>
                
                <button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold p-4 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                    onClick={() => onStart(name, number, testMode)}
                    disabled={!name.trim()}
                >
                    Start Writing Test
                </button>
            </div>
        </div>
    );
};

const SettingsModal = ({ textSize, setTextSize, onClose }: any) => {
    const sizes = [
        { label: 'Small (14px)', value: 14 },
        { label: 'Medium (16px)', value: 16 },
        { label: 'Large (18px)', value: 18 },
        { label: 'Extra Large (20px)', value: 20 },
    ];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-96 overflow-hidden animate-in slide-in-from-bottom-4" onClick={e => e.stopPropagation()}>
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-lg">Settings</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm font-semibold text-gray-700 mb-4">Text Size</p>
                    <div className="space-y-2">
                        {sizes.map((s) => (
                            <label key={s.value} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${textSize === s.value ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input 
                                    type="radio" 
                                    name="textSize" 
                                    value={s.value} 
                                    checked={textSize === s.value}
                                    onChange={() => setTextSize(s.value)}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-3 font-medium text-gray-800" style={{ fontSize: `${s.value}px` }}>{s.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SubmitModal = ({ onConfirm, onCancel }: any) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in">
        <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in slide-in-from-bottom-4 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Submit Test</h3>
            <p className="text-gray-600 mb-8">Are you sure you want to submit your IELTS Writing test? You will not be able to edit your answers after submitting.</p>
            <div className="flex gap-4 justify-center">
                <button className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors" onClick={onCancel}>Cancel</button>
                <button className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 shadow-md transition-colors" onClick={onConfirm}>Submit</button>
            </div>
        </div>
    </div>
);

const Header = ({ studentName, candidateNumber, timeLeft, saveStatus, onOpenSettings, onOpenSubmit, isSubmitted, testMode, isTimePaused, onTogglePause }: any) => {
    const displayName = candidateNumber ? `${studentName} - ${candidateNumber}` : studentName;
    
    return (
        <header className="bg-gradient-to-b flex-none from-slate-700 to-slate-800 text-white px-5 py-2.5 flex justify-between items-center shadow-lg z-20 relative">
            <div className="flex items-center gap-3 font-medium text-sm">
                <div className="bg-white/10 p-1.5 rounded text-gray-300">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                {displayName}
            </div>
            
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center bg-black/20 px-4 py-1.5 rounded-full border border-white/10">
                <svg className={`w-4 h-4 mr-2 ${timeLeft <= 300 ? 'text-red-400 animate-pulse' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className={`font-bold tracking-wide ${timeLeft <= 300 ? 'text-red-400' : 'text-white'}`}>
                    {isSubmitted ? "Test Completed" : formatTime(timeLeft)}
                </span>
                {testMode === 'practice' && !isSubmitted && (
                    <button 
                        onClick={onTogglePause} 
                        className="ml-3 px-2 py-0.5 text-xs font-semibold bg-white/20 hover:bg-white/30 border border-white/30 rounded text-white transition-colors"
                    >
                        {isTimePaused ? 'Resume' : 'Pause'}
                    </button>
                )}
            </div>
            
            <div className="flex gap-4 items-center">
                {!isSubmitted && (
                    <span className={`text-xs font-medium px-2 py-1 rounded ${saveStatus === 'Saved' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {saveStatus}
                    </span>
                )}
                <button className="bg-gradient-to-b from-white to-slate-50 border border-slate-400 text-slate-800 font-semibold px-4 py-1 text-[13px] rounded shadow-sm hover:translate-y-[-1px] transition-transform flex items-center gap-2" onClick={onOpenSettings}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Settings
                </button>
                {!isSubmitted && (
                    <button className="bg-gradient-to-b from-white to-slate-50 border border-red-200 text-red-600 font-semibold px-4 py-1 text-[13px] rounded shadow-sm hover:translate-y-[-1px] transition-transform flex items-center gap-2" onClick={onOpenSubmit}>
                        Submit Test
                    </button>
                )}
            </div>
        </header>
    );
};

const PromptPanel = ({ activePart, textSize }: any) => (
    <div className="flex-1 bg-white border border-gray-200 p-8 overflow-y-auto shadow-inner md:rounded-l-md" style={{ fontSize: `${textSize}px` }}>
        {activePart === 1 ? (
            <div className="text-gray-800 leading-relaxed animate-in fade-in">
                <p className="font-bold mb-5">The chart below gives information about global energy consumption by source from 2000 to 2020.</p>
                <p className="font-bold mb-8">Summarise the information by selecting and reporting the main features, and make comparisons where relevant.</p>
                
                <h3 className="text-center font-bold mb-4 mt-10 text-gray-700">Global Energy Consumption (Exajoules)</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full border-collapse mt-0" style={{ fontSize: `${Math.max(12, textSize - 2)}px` }}>
                        <thead>
                            <tr>
                                <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">Energy Source</th>
                                <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">2000</th>
                                <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">2010</th>
                                <th className="bg-slate-50 text-left p-3 border border-slate-300 font-bold">2020</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="hover:bg-gray-50"><td className="p-3 border border-slate-300">Fossil Fuels</td><td className="p-3 border border-slate-300">350</td><td className="p-3 border border-slate-300">420</td><td className="p-3 border border-slate-300">400</td></tr>
                            <tr className="hover:bg-gray-50"><td className="p-3 border border-slate-300">Nuclear</td><td className="p-3 border border-slate-300">25</td><td className="p-3 border border-slate-300">28</td><td className="p-3 border border-slate-300">26</td></tr>
                            <tr className="hover:bg-gray-50"><td className="p-3 border border-slate-300">Renewables</td><td className="p-3 border border-slate-300">30</td><td className="p-3 border border-slate-300">45</td><td className="p-3 border border-slate-300">85</td></tr>
                            <tr className="hover:bg-gray-50 font-bold bg-gray-50"><td className="p-3 border border-slate-300">Total</td><td className="p-3 border border-slate-300">405</td><td className="p-3 border border-slate-300">493</td><td className="p-3 border border-slate-300">511</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="text-gray-800 leading-relaxed animate-in fade-in">
                <p className="mb-5 italic text-gray-600">Write about the following topic:</p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-r-lg">
                    <p className="font-bold mb-4">
                        Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. <br/><br/>
                        Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer.
                    </p>
                </div>
                <p className="font-bold mb-8">
                    Discuss both these views and give your own opinion.
                </p>
                <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-100">
                    Give reasons for your answer and include any relevant examples from your own knowledge or experience.
                </p>
            </div>
        )}
    </div>
);

const WritingEditor = ({ text, onTextChange, textSize, minWords, isActive, isSubmitted, testStartTime }: any) => {
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const words = wordCount(text);
    const chars = charCount(text);
    const paras = paragraphCount(text);
    
    const typingTimeMin = testStartTime ? Math.floor((Date.now() - testStartTime) / 60000) : 0;

    const updateCursor = () => {
        if (!textareaRef.current) return;
        const pos = textareaRef.current.selectionStart;
        const textUpToPos = text.substring(0, pos);
        const lines = textUpToPos.split('\n');
        setCursorPos({
            line: lines.length,
            col: lines[lines.length - 1].length + 1
        });
    };

    useEffect(() => {
        if (isActive && textareaRef.current && !isSubmitted) {
            textareaRef.current.focus();
        }
    }, [isActive, isSubmitted]);

    return (
        <div className={`flex-1 flex flex-col bg-white border-y border-r border-gray-200 md:rounded-r-md ${!isActive ? 'hidden' : ''}`}>
            <div className="flex-1 relative">
                {isSubmitted && (
                    <div className="absolute inset-0 bg-gray-50/50 z-10 cursor-not-allowed"></div>
                )}
                <textarea 
                    ref={textareaRef}
                    className="w-full h-full p-8 outline-none resize-none text-gray-800 leading-loose scroll-smooth"
                    style={{ fontSize: `${textSize}px` }}
                    value={text}
                    onChange={(e) => {
                        onTextChange(e.target.value);
                        updateCursor();
                    }}
                    onKeyUp={updateCursor}
                    onClick={updateCursor}
                    spellCheck="false"
                    disabled={isSubmitted}
                    placeholder="Begin writing your response here..."
                />
            </div>
            
            <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-between items-center text-xs text-gray-600 font-medium">
                <div className="flex gap-6">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        {chars} Characters
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                        {paras} Paragraphs
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {typingTimeMin} min
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                        Ln {cursorPos.line}, Col {cursorPos.col}
                    </span>
                </div>
                
                <div className={`font-bold flex items-center gap-2 ${words >= minWords ? 'text-green-600' : 'text-red-500'}`}>
                    {words >= minWords ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    )}
                    Words: {minWords} / {words}
                </div>
            </div>
        </div>
    );
};

const FooterNavigation = ({ activePart, setActivePart, words1, words2, reviewState, toggleReview }: any) => {
    const isP1Done = words1 >= 150;
    const isP2Done = words2 >= 250;

    const getNavClass = (partNum: number, isDone: boolean) => {
        if (activePart === partNum) return 'bg-blue-500 text-white border-blue-600 shadow-inner';
        if (isDone) return 'bg-green-500 text-white border-green-600 shadow-sm';
        return 'bg-gray-300 text-gray-700 border-gray-400 shadow-sm';
    };

    return (
        <footer className="bg-gradient-to-b from-slate-50 to-slate-200 border-t border-slate-300 px-6 py-3 flex-none flex justify-between items-center z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-8">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
                    <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                        checked={reviewState[activePart] || false}
                        onChange={() => toggleReview(activePart)}
                    />
                    Review
                </label>

                <div className="flex items-center gap-6 text-sm font-bold text-gray-700">
                    <div className="flex items-center cursor-pointer group hover:opacity-80 transition-opacity" onClick={() => setActivePart(1)}>
                        Part 1 
                        <span className={`w-6 h-6 flex items-center justify-center text-[13px] font-bold ml-1.5 rounded transition-all ${getNavClass(1, isP1Done)}`}>1</span>
                    </div>
                    <div className="flex items-center cursor-pointer group hover:opacity-80 transition-opacity" onClick={() => setActivePart(2)}>
                        Part 2 
                        <span className={`w-6 h-6 flex items-center justify-center text-[13px] font-bold ml-1.5 rounded transition-all ${getNavClass(2, isP2Done)}`}>2</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="text-gray-400 hover:text-yellow-500 transition-colors group relative" title="Add Note">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v3h-2V7h-3V5h3V2h2v3h3v2z" transform="rotate(45 12 12)"/>
                    </svg>
                </button>
                <button 
                    className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 hover:shadow transition-all active:scale-95"
                    onClick={() => setActivePart(activePart === 1 ? 2 : 1)}
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>
            </div>
        </footer>
    );
};

export const ComputerWritingTest = ({ submissionId }: { submissionId?: string }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    
    if (id === '3' && !submissionId) {
        return <JanuaryWritingTest />;
    }
    if (id === '7' && !submissionId) {
        return <FebruaryWritingTest />;
    }
    if (id === '11' && !submissionId) {
        return <MarchWritingTest />;
    }
    if (id === '15' && !submissionId) {
        return <AprilWritingTest />;
    }

    if (id === '19' && !submissionId) {
        return <MayWritingTest />;
    }
    if (id === '23' && !submissionId) {
        return <JuneWritingTest />;
    }

    const [state, setState] = useState({
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
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const [isEvaluating, setIsEvaluating] = useState(false);

    const [isEditingReport, setIsEditingReport] = useState(false);
    const [editedFeedback, setEditedFeedback] = useState("");
    const [editedBandScore, setEditedBandScore] = useState(0);

    const handleGenerateReport = async () => {
        setIsEvaluating(true);
        let finalFeedback = "";
        let finalBandScore = 0;

        try {
            const textToEvaluate = state.textPart2.trim() || state.textPart1.trim();
            const response = await fetch('/api/evaluate-writing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputText: textToEvaluate, taskType: state.textPart2.trim() ? 'task2' : 'task1', rawPrompt: state.textPart2.trim() ? "Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer. Discuss both these views and give your own opinion." : "The chart below gives information about global energy consumption by source from 2000 to 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. (Assume the chart shows global energy consumption increasing from 2000 to 2020, with Oil being the highest but relatively stable, Coal rising sharply until 2010 then plateauing, Natural Gas rising steadily, and Renewables starting low but growing rapidly)." })
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
    };

    const handleSaveEditedReport = async () => {
        try {
            if (submissionId) {
                const { updateDoc, doc } = await import('firebase/firestore');
                const docRef = doc(db, 'submissions', submissionId);
                await updateDoc(docRef, {
                    bandScore: editedBandScore,
                    aiFeedback: editedFeedback
                });
            } else if (id) {
                const key = `${STORAGE_KEY}_${id}`;
                const saved = localStorage.getItem(key);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    parsed.aiFeedback = editedFeedback;
                    parsed.aiBandScore = editedBandScore;
                    localStorage.setItem(key, JSON.stringify(parsed));
                }
            }
            setState(prev => ({
                ...prev,
                aiFeedback: editedFeedback,
                aiBandScore: editedBandScore
            }));
            setIsEditingReport(false);
        } catch (err) {
            console.error("Error saving report", err);
            alert("Failed to save edited report.");
        }
    };

    const stateRef = useRef(state);
    useEffect(() => { stateRef.current = state; }, [state]);

    // Cleanup and load
    useEffect(() => {
        async function loadSubmission() {
            if (submissionId) {
                try {
                    const docRef = doc(db, 'submissions', submissionId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        let parsedAnswers: any = {};
                        if (typeof data.answers === 'string') {
                            try {
                                parsedAnswers = JSON.parse(data.answers);
                            } catch (e) {
                                parsedAnswers = { part1: data.answers, part2: '' };
                            }
                        } else if (typeof data.answers === 'object' && data.answers !== null) {
                            parsedAnswers = data.answers;
                        }
                        setState(prev => ({
                            ...prev,
                            examStarted: true,
                            isSubmitted: true,
                            studentName: data.studentName || prev.studentName,
                            textPart1: parsedAnswers.part1 || '',
                            textPart2: parsedAnswers.part2 || '',
                            submitTime: data.createdAt?.toMillis ? data.createdAt.toMillis() : (typeof data.createdAt === 'number' ? data.createdAt : Date.now()),
                            aiFeedback: data.aiFeedback || '',
                            aiBandScore: data.bandScore || null
                        }));
                        setTimeLeft(0);
                        return; // do not load local state if viewing a past submission
                    }
                } catch (error) {
                    console.error("Error loading submission:", error);
                }
            }
            
            // load from local storage if not viewing a past submission
            const key = `${STORAGE_KEY}_${id}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.examStarted && !parsed.isSubmitted) {
                        setState(parsed);
                        const elapsed = Math.floor((Date.now() - parsed.testStartTime) / 1000);
                        const remaining = Math.max(0, TEST_DURATION - elapsed);
                        setTimeLeft(remaining);
                    } else if (parsed.isSubmitted) {
                        setState(parsed);
                        setTimeLeft(0);
                    }
                } catch (e) {
                    console.error("Failed to parse saved state.");
                }
            }
        }
        loadSubmission();
    }, [id, submissionId]);

    useEffect(() => {
        if (!state.examStarted || state.isSubmitted || submissionId) return;
        
        setSaveStatus("Saving...");
        const timer = setTimeout(() => {
            const key = `${STORAGE_KEY}_${id}`;
            localStorage.setItem(key, JSON.stringify(state));
            setSaveStatus("Saved");
        }, 500);

        return () => clearTimeout(timer);
    }, [state, id, submissionId]);

    useEffect(() => {
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
    }, [state.examStarted, state.isSubmitted, isTimePaused]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (state.examStarted && !state.isSubmitted) {
                const msg = "Your IELTS writing test is still in progress.";
                e.preventDefault();
                e.returnValue = msg;
                return msg;
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [state.examStarted, state.isSubmitted]);

    const handleStartTest = (name: string, number: string, testMode: 'practice' | 'mock' = 'practice') => {
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
    };

    const updateState = (updates: any) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const handleTextChange = (part: number, text: string) => {
        if (part === 1) updateState({ textPart1: text });
        else updateState({ textPart2: text });
    };

    const toggleReview = (part: number) => {
        setState(prev => ({
            ...prev,
            reviewState: { ...prev.reviewState, [part]: !prev.reviewState[part] }
        }));
    };

    const handleConfirmSubmit = async () => {
        if (!state.textPart1.trim() && !state.textPart2.trim()) {
            alert("Your writing response is empty. Please write something before submitting.");
            setShowSubmitModal(false);
            return;
        }

        const submitTime = Date.now();
        setState(prev => {
            const newState = {
                ...prev,
                isSubmitted: true,
                submitTime,
                aiFeedback: "",
                aiBandScore: 0
            };
            localStorage.setItem(`${STORAGE_KEY}_${id}`, JSON.stringify(newState));
            return newState;
        });
        
        setShowSubmitModal(false);
        setTimeLeft(0);

        if (user) {
            try {
                let title = 'Writing Test';
                if (id) {
                    title = id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                }
                
                await addDoc(collection(db, 'submissions'), {
                    userId: user.uid,
                    studentName: state.studentName,
                    assignmentId: id,
                    assignmentTitle: title,
                    assignmentType: 'writing',
                    createdAt: serverTimestamp(),
                    status: 'submitted',
                    answers: JSON.stringify({ part1: state.textPart1, part2: state.textPart2 }),
                    aiFeedback: "",
                    bandScore: 0,
                    timeSpent: TEST_DURATION - timeLeft,
                    requiresEvaluation: false 
                });
            } catch (error) {
                console.error("Failed to save submission to database", error);
            }
        }
    };

    if (!state.examStarted) {
        return <LoginScreen onStart={handleStartTest} initialName={state.studentName} />;
    }

    return (
        <div className="flex flex-col h-screen bg-[#c1c5cc] font-sans">
            <Header 
                studentName={state.studentName}
                candidateNumber={state.candidateNumber}
                timeLeft={timeLeft}
                saveStatus={saveStatus}
                onOpenSettings={() => setShowSettings(true)}
                onOpenSubmit={() => setShowSubmitModal(true)}
                isSubmitted={state.isSubmitted}
                testMode={state.testMode}
                isTimePaused={isTimePaused}
                onTogglePause={() => setIsTimePaused(!isTimePaused)}
            />

            <div className="flex-1 flex flex-col mx-3 mt-3 mb-0 bg-white shadow-xl overflow-hidden border border-gray-300 rounded-t-xl z-10 relative">
                
                {isEvaluating && (
                    <div className="absolute inset-0 z-40 bg-white/90 backdrop-blur-sm flex items-center justify-center auto-fade-in">
                        <div className="bg-white p-10 rounded-2xl shadow-xl text-center border border-blue-100 max-w-sm w-full mx-4">
                            <div className="flex justify-center mb-6">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-3">AI is Evaluating</h3>
                            <p className="text-slate-600 mb-2">Analyzing your writing...</p>
                            <p className="text-sm text-slate-400">This generally takes 15-30 seconds.</p>
                        </div>
                    </div>
                )}
                
                {state.isSubmitted && !isEvaluating && (
                    <div className="absolute inset-0 z-40 bg-slate-50 flex flex-col items-center auto-fade-in overflow-y-auto">
                        <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <EraLogo className="w-8 h-8" />
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Test Submitted Successfully</h2>
                                    <p className="text-sm text-slate-500">Timestamp: {new Date(state.submitTime).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Return to Dashboard
                                </button>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem(`${STORAGE_KEY}_${id}`);
                                        window.location.reload();
                                    }}
                                    className="bg-slate-100 text-slate-700 font-bold py-2 px-5 rounded-lg hover:bg-slate-200 transition border border-slate-300"
                                >
                                    Retake Test
                                </button>
                            </div>
                        </div>

                        <div className="w-full max-w-4xl p-6 md:p-10 my-6 bg-white rounded-2xl shadow-md border border-slate-200">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                                <h3 className="text-2xl font-bold text-slate-800">
                                    {(state.aiFeedback && !state.aiFeedback.includes('pending')) ? "Official Examiner Report" : "Teacher Jan will check your writing. Please wait!"}
                                </h3>
                                <div className="flex items-center gap-3">
                                    {isAdmin && state.aiFeedback && !state.aiFeedback.includes('pending') && !isEditingReport && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditedFeedback(state.aiFeedback);
                                                    setEditedBandScore(state.aiBandScore);
                                                    setIsEditingReport(true);
                                                }}
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition border border-slate-200"
                                            >
                                                Edit Report
                                            </button>
                                            <button
                                                onClick={handleGenerateReport}
                                                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-bold rounded-xl transition border border-blue-200 flex items-center justify-center cursor-pointer"
                                            >
                                                Re-evaluate
                                            </button>
                                        </>
                                    )}
                                    {state.aiBandScore > 0 && !isEditingReport && (
                                        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-xl flex items-center gap-2">
                                            <Award className="w-5 h-5 text-blue-600" />
                                            <span className="font-bold">Overall Band: {state.aiBandScore}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="prose prose-blue max-w-none prose-p:text-slate-700 prose-headings:text-slate-800">
                                {isEditingReport ? (
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Overall Band Score</label>
                                            <input 
                                                type="number" 
                                                step="0.5" 
                                                min="0" 
                                                max="9" 
                                                value={editedBandScore} 
                                                onChange={e => setEditedBandScore(parseFloat(e.target.value))}
                                                className="w-32 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Feedback (Markdown)</label>
                                            <textarea 
                                                value={editedFeedback}
                                                onChange={e => setEditedFeedback(e.target.value)}
                                                className="w-full h-96 p-4 border border-slate-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            ></textarea>
                                        </div>
                                        <div className="flex justify-end gap-3 mt-4">
                                            <button 
                                                onClick={() => setIsEditingReport(false)}
                                                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={handleSaveEditedReport}
                                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-md"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </div>
                                ) : state.aiFeedback && !state.aiFeedback.includes('pending') ? (
                                    <div dangerouslySetInnerHTML={renderMarkdown(state.aiFeedback)} />
                                ) : (
                                    <div className="text-center p-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-600 mb-2 font-medium">Your essay has been saved successfully.</p>
                                        
                                        {isAdmin && (
                                            <button 
                                                onClick={handleGenerateReport}
                                                disabled={isEvaluating}
                                                className="mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:-translate-y-1 flex items-center space-x-3 cursor-pointer border border-indigo-400/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {isEvaluating ? (
                                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <svg className="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                                )}
                                                <span className="text-lg tracking-wide">{isEvaluating ? 'Generating...' : 'Generate Official Report'}</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="px-8 py-5 bg-[#f8fafc] border-b border-gray-200 flex-none">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Part {state.activePart}</h2>
                    <p className="text-[15px] text-gray-600 font-medium">
                        You should spend about {state.activePart === 1 ? "20" : "40"} minutes on this task. 
                        Write at least {state.activePart === 1 ? "150" : "250"} words.
                    </p>
                </div>

                <div className="flex-1 flex flex-col md:flex-row bg-[#f1f5f9] p-4 gap-4 overflow-hidden min-h-0">
                    <PromptPanel 
                        activePart={state.activePart} 
                        textSize={state.textSize} 
                    />
                    
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
                    onCancel={() => setShowSubmitModal(false)}
                    onConfirm={handleConfirmSubmit}
                />
            )}
        </div>
    );
};
