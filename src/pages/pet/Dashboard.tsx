import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useParams, useSearchParams, Link } from 'react-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PETCalculator } from '../../components/PETCalculator';

import { Edit2, X } from 'lucide-react';
import { BookOpen, PenTool, Headphones, Mic, PlayCircle, Upload, Trash2, Download } from 'lucide-react';

const calculateCambridgeScore = (scores: any) => {
    return Math.round((scores.reading + scores.writing + scores.listening + scores.speaking) / 4);
};

const getGradeDetails = (score: number) => {
    if (score >= 160) return { grade: 'Grade A', cefr: 'B2', status: 'Pass at Grade A' };
    if (score >= 153) return { grade: 'Grade B', cefr: 'B1', status: 'Pass at Grade B' };
    if (score >= 140) return { grade: 'Grade C', cefr: 'B1', status: 'Pass at Grade C' };
    if (score >= 120) return { grade: 'Level A2', cefr: 'A2', status: 'Level A2' };
    return { grade: 'Fail', cefr: 'Below A2', status: 'Not Qualified' };
};

const HeroSection = ({ data, isAdmin, onEditProfile }: { data: any, isAdmin: boolean, onEditProfile: () => void }) => {
    const overallScore = calculateCambridgeScore(data.scores);
    const gradeInfo = getGradeDetails(overallScore);
    
    const percentage = ((overallScore - 120) / (170 - 120)) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-[slideUp_0.5s_ease-out_forwards] opacity-0" style={{animationFillMode: 'forwards'}}>
            {/* Simplified Welcome Card */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-6 border border-slate-100">
                <div className="w-[88px] h-[88px] bg-[#005587] rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-md overflow-hidden shrink-0">
                    {data.profile.photoURL ? (
                        <img src={data.profile.photoURL} alt={data.profile.name} className="w-full h-full object-cover" />
                    ) : (
                        data.profile.initials
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-1">Welcome back, {data.profile.name}</h1>
                            <p className="text-slate-500 font-medium">Cambridge PET Candidate • {data.profile.candidateNumber}</p>
                        </div>
                        {isAdmin && (
                            <button 
                                onClick={onEditProfile}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Profile"
                            >
                                <Edit2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Overall Score Circle Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center relative border border-slate-100">
                <div className="absolute top-6 left-6">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Score</span>
                </div>
                <div className="absolute top-6 right-6">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">CEFR {gradeInfo.cefr}</span>
                </div>
                
                <div className="relative inline-flex items-center justify-center mt-6 mb-2">
                    <svg className="w-28 h-28 transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                        <circle cx="56" cy="56" r="48" stroke="#DB4A38" strokeWidth="10" fill="none" strokeDasharray="301.59" strokeDashoffset={301.59 - (clampedPercentage / 100) * 301.59} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-800">{overallScore}</span>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xl font-bold text-slate-800">{gradeInfo.status}</p>
                </div>
            </div>
        </div>
    );
};

const CambridgeClassicProfile = ({ scores, overallScore, gradeInfo }: { scores: any, overallScore: number, gradeInfo: any }) => {
    const yMax = 175;
    const yMin = 105;
    const yRange = yMax - yMin;
    const getTop = (val: number) => `${((yMax - val) / yRange) * 100}%`;
    const getHeight = (high: number, low: number) => `${((high - low) / yRange) * 100}%`;

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 mb-8 animate-[slideUp_0.5s_ease-out_forwards] opacity-0 overflow-x-auto" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <div className="min-w-[750px]">
                {/* Top Result Banners (Blue) */}
                <div className="flex gap-4 mb-10">
                    <div className="flex-1 bg-[#005587] text-white p-5 rounded-2xl shadow-sm">
                        <div className="text-sm font-medium text-blue-100 mb-1">Result</div>
                        <div className="font-bold text-2xl">{gradeInfo.status}</div>
                    </div>
                    <div className="flex-1 bg-[#005587] text-white p-5 rounded-2xl shadow-sm">
                        <div className="text-sm font-medium text-blue-100 mb-1">Overall Score</div>
                        <div className="font-bold text-3xl">{overallScore}</div>
                    </div>
                    <div className="flex-1 bg-[#005587] text-white p-5 rounded-2xl shadow-sm">
                        <div className="text-sm font-medium text-blue-100 mb-1">CEFR Level</div>
                        <div className="font-bold text-3xl">{gradeInfo.cefr}</div>
                    </div>
                </div>

                {/* Chart Grid */}
                <div className="relative font-sans text-gray-800">
                    <div className="grid grid-cols-[60px_90px_110px_1fr_1fr_1fr_1fr] gap-x-4 h-14 items-end text-center font-bold text-xs mb-4">
                        <div>CEFR Level</div>
                        <div className="leading-tight">Cambridge<br/>English<br/>Scale</div>
                        <div className="leading-tight">Certificated<br/>Results</div>
                        <div>Reading</div>
                        <div>Writing</div>
                        <div>Listening</div>
                        <div>Speaking</div>
                    </div>

                    <div className="relative grid grid-cols-[60px_90px_110px_1fr_1fr_1fr_1fr] gap-x-4 h-[420px]">
                        <div className="absolute left-0 right-0 border-b-2 border-dotted border-gray-400 z-0" style={{ top: getTop(160) }}></div>
                        <div className="absolute left-0 right-0 border-b-2 border-dotted border-gray-400 z-0" style={{ top: getTop(140) }}></div>
                        <div className="absolute left-0 right-0 border-b-2 border-dotted border-gray-400 z-0" style={{ top: getTop(120) }}></div>

                        <div className="relative z-10 font-bold text-2xl text-black">
                            <div className="absolute w-full text-center" style={{ top: getTop(165), transform: 'translateY(-50%)' }}>B2</div>
                            <div className="absolute w-full text-center" style={{ top: getTop(150), transform: 'translateY(-50%)' }}>B1</div>
                            <div className="absolute w-full text-center" style={{ top: getTop(130), transform: 'translateY(-50%)' }}>A2</div>
                        </div>

                        <div className="relative bg-[#EAEAEA] z-10 border-l border-r border-gray-300 shadow-inner">
                            {Array.from({length: 61}).map((_, i) => {
                                const val = 170 - i;
                                const isMajor = val % 10 === 0;
                                const isMedium = val % 5 === 0 && !isMajor;
                                return (
                                    <div key={val} className="absolute w-full flex justify-end items-center pr-1.5" style={{ top: getTop(val), transform: 'translateY(-50%)' }}>
                                        {isMajor && <span className="absolute left-2 text-xs font-bold text-gray-700">{val}</span>}
                                        <div className={`border-b border-gray-500 ${isMajor ? 'w-4 border-b-2' : isMedium ? 'w-3 border-b-2' : 'w-1.5'}`}></div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="relative z-10 text-white text-xs font-bold text-center">
                            <div className="absolute w-full bg-[#7A7A7A] flex items-center justify-center border-b-[2px] border-white" style={{ top: getTop(170), height: getHeight(170, 160) }}>Grade A</div>
                            <div className="absolute w-full bg-[#959595] flex items-center justify-center border-b-[2px] border-white" style={{ top: getTop(160), height: getHeight(160, 153) }}>Grade B</div>
                            <div className="absolute w-full bg-[#7A7A7A] flex items-center justify-center border-b-[2px] border-white" style={{ top: getTop(153), height: getHeight(153, 140) }}>Grade C</div>
                            <div className="absolute w-full bg-[#959595] flex items-center justify-center" style={{ top: getTop(140), height: getHeight(140, 120) }}>Level A2</div>
                        </div>

                        {['reading', 'writing', 'listening', 'speaking'].map((skill) => (
                            <div key={skill} className="relative bg-[#EAEAEA] z-10 shadow-inner">
                                <div className="absolute w-full pr-[2px]" style={{ top: getTop(scores[skill as keyof typeof scores]), transform: 'translateY(-50%)' }}>
                                    <div className="relative bg-[#005587] h-[28px] ml-3.5 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        <div className="absolute -left-[13px] top-0 w-0 h-0 border-y-[14px] border-y-transparent border-r-[14px] border-r-[#005587]"></div>
                                        {scores[skill as keyof typeof scores]}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SkillCard = ({ title, score, target, colorClass, bgClass, Icon, details }: any) => (
    <div className="bg-white rounded-[2rem] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${bgClass} ${colorClass}`}>
                <Icon size={24} />
            </div>
            <div className="text-right">
                <span className="block text-3xl font-black text-slate-800">{score}</span>
                <span className="text-xs font-medium text-slate-400">Target: {target}</span>
            </div>
        </div>
        
        <h4 className="font-bold text-lg text-slate-800 mb-4">{title}</h4>

        <div className="space-y-3 pt-4 border-t border-slate-50">
            {details.map((d: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-500">{d.label}</span>
                    <span className="font-semibold text-slate-700">{d.value}</span>
                </div>
            ))}
        </div>
    </div>
);

const ActivitySectionHeader = ({ title, Icon, colorClass, isAdmin, onAddOffline }: any) => (
    <div className="flex justify-between items-center mb-4 mt-10">
        <h3 className={`font-bold text-xl flex items-center gap-2 ${colorClass}`}>
            <Icon className="w-5 h-5" /> {title}
        </h3>
        <div className="flex items-center gap-4">
            {isAdmin && (
                <button 
                    onClick={onAddOffline}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                    + Add Offline Entry
                </button>
            )}
            <button className="text-blue-600 text-sm font-bold hover:underline uppercase tracking-wider">View All &rarr;</button>
        </div>
    </div>
);

const SpeakingActivity = ({ isAdmin, data, onDelete, onAddOffline, onViewFeedback }: any) => (
    <div>
        <ActivitySectionHeader title="Speaking Recordings" Icon={Mic} colorClass="text-purple-700" isAdmin={isAdmin} onAddOffline={() => onAddOffline('Speaking')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {data.length === 0 ? (
                <div className="text-slate-400 text-sm italic col-span-2">No speaking recordings found.</div>
            ) : data.map((item: any, idx: number) => (
                <div key={idx} className="bg-white rounded-3xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex gap-4 border border-slate-100">
                    <div className="relative w-32 h-24 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                        <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Video thumbnail" className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <PlayCircle className="text-white w-8 h-8 opacity-80 hover:opacity-100 cursor-pointer transition-opacity" />
                        </div>
                    </div>
                    <div className="flex flex-col justify-between py-1 w-full">
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1">{item.name}</h4>
                            <p className="text-xs font-semibold text-slate-500 mb-1">Score {item.score} <span className="text-slate-300 mx-1">•</span> {item.time || 'N/A'} <span className="text-slate-300 mx-1">•</span> {item.date}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => onViewFeedback(item)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-1.5 rounded-lg transition-colors border border-slate-200">Feedback</button>
                            {isAdmin && (
                                <button onClick={() => onDelete('speaking', idx)} className="w-8 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg flex items-center justify-center transition-colors border border-slate-200"><Trash2 className="w-3.5 h-3.5" /></button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const TableActivity = ({ title, type, Icon, colorClass, data, isAdmin, onDelete, onAddOffline }: any) => (
    <div>
        <ActivitySectionHeader title={title} Icon={Icon} colorClass={colorClass} isAdmin={isAdmin} onAddOffline={() => onAddOffline(type)} />
        <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden border border-slate-100">
            {data.length === 0 ? (
                <div className="p-6 text-slate-400 text-sm italic">No {type.toLowerCase()} activity found.</div>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 text-xs text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Test Name</th>
                            <th className="px-6 py-4">Score</th>
                            <th className="px-6 py-4">Correct</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Date</th>
                            {isAdmin && <th className="px-6 py-4"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800">{row.link ? <a href={row.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{row.name}</a> : row.name}</td>
                                <td className={`px-6 py-4 font-bold ${row.score === '0.0' ? 'text-blue-600' : 'text-green-600'}`}>{row.score}</td>
                                <td className="px-6 py-4 text-slate-500">{row.correct}</td>
                                <td className="px-6 py-4 text-slate-500">{row.time || '-'}</td>
                                <td className="px-6 py-4 text-slate-500">{row.date}</td>
                                {isAdmin && (
                                    <td className="px-6 py-4 text-right text-slate-300 hover:text-red-500 cursor-pointer">
                                        <Trash2 className="w-4 h-4 inline" onClick={() => onDelete(type.toLowerCase(), idx)} />
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </div>
);

const WritingActivity = ({ isAdmin, data, onDelete, onAddOffline, onViewFeedback }: any) => (
    <div>
        <ActivitySectionHeader title="Writing Activity" Icon={PenTool} colorClass="text-orange-500" isAdmin={isAdmin} onAddOffline={() => onAddOffline('Writing')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.length === 0 ? (
                <div className="text-slate-400 text-sm italic col-span-2">No writing activity found.</div>
            ) : data.map((test: any, idx: number) => (
                <div key={idx} className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col h-full">
                    <h4 className="font-bold text-slate-800 text-lg">{test.link ? <a href={test.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">{test.name}</a> : test.name}</h4>
                    <p className="text-xs text-slate-500 mb-4">{test.date}</p>
                    
                    <div className="flex gap-6 mb-6">
                        <div>
                            <div className="text-xs font-bold text-slate-400 mb-1">SCORE</div>
                            <div className="font-black text-xl text-slate-800">{test.score || test.band || '-'}</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 mb-1">WORDS</div>
                            <div className="font-black text-xl text-slate-800">{test.words || '-'}</div>
                        </div>
                    </div>
                    
                    <div className="mt-auto flex gap-2">
                        <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors border border-slate-200">Read Essay</button>
                        <button onClick={() => onViewFeedback(test)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors border border-slate-200">Feedback</button>
                        {isAdmin && (
                            <button onClick={() => onDelete('writing', idx)} className="w-10 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-colors border border-slate-200"><Trash2 className="w-4 h-4" /></button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export function Dashboard({ isShared = false }: { isShared?: boolean }) {
    const { user, userCourse, isAdmin } = useAuth();
    const { userId: paramUserId } = useParams();
    const [searchParams] = useSearchParams();
    
    let targetUserId = isShared ? paramUserId : (isAdmin && searchParams.get('userId')) ? searchParams.get('userId') : user?.uid;

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhotoURL, setEditPhotoURL] = useState('');
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [activities, setActivities] = useState<any>({
        reading: [
            { name: "May Reading Practice", score: "0.0", correct: "0/40", time: "0m 4s", date: "Jul 7" },
            { name: "May Reading Practice", score: "0.0", correct: "0/40", time: "-", date: "Jul 4" },
            { name: "March Reading Practice", score: "0.0", correct: "0/40", time: "0m 3s", date: "Jul 4" }
        ],
        listening: [
            { name: "January Listening Practice", score: "0.0", correct: "1/40", time: "0m 7s", date: "Jul 4" },
            { name: "February Listening Practice", score: "5.5", correct: "22/40", time: "3m 25s", date: "Jun 26" }
        ],
        writing: [
            { name: "February Writing Practice", date: "Jul 1, 2026", band: "5.0", words: "235" },
            { name: "Test 1", date: "Jun 27, 2026", band: "5.5", words: "2" }
        ],
        speaking: [
            { name: "Test 1", date: "Jun 27, 2026", score: "5.5", time: "14m" }
        ]
    });
    
    const readingData = activities.reading;
    const listeningData = activities.listening;
    const writingData = activities.writing;
    const speakingData = activities.speaking;


    const [showAddOffline, setShowAddOffline] = useState(false);
    const [offlineType, setOfflineType] = useState('Reading');
    const [offlineForm, setOfflineForm] = useState({ name: '', link: '', score: '', correct: '', time: '', date: new Date().toISOString().split('T')[0], feedback: '' });
    const [viewFeedbackItem, setViewFeedbackItem] = useState<any>(null);
    




    useEffect(() => {
        if (!targetUserId) return;
        
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, 'users', targetUserId as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfileData(data);
                    if (data.petActivities) {
                        setActivities((prev: any) => ({
                            ...prev,
                            ...data.petActivities
                        }));
                    }
                }
            } catch (err) {
                console.error("Error fetching profile", err);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [targetUserId]);
    
    const saveActivitiesToFirestore = async (newActivities: any) => {
        if (!targetUserId) return;
        try {
            await updateDoc(doc(db, 'users', targetUserId), {
                petActivities: newActivities
            });
        } catch (err) {
            console.error("Failed to save activities", err);
        }
    };


    if (!isShared && !isAdmin && userCourse?.toLowerCase() !== 'pet') {
        return <Navigate to="/ielts/dashboard" replace />;
    }

    const handleSaveProfile = async () => {
        if (!targetUserId) return;
        try {
            await updateDoc(doc(db, 'users', targetUserId), {
                name: editName,
                photoURL: editPhotoURL
            });
            setProfileData((prev: any) => ({ ...prev, name: editName, photoURL: editPhotoURL }));
            setIsEditingProfile(false);
        } catch (err) {
            console.error("Error updating profile", err);
            alert("Failed to update profile.");
        }
    };

    const handleOpenEdit = () => {
        setEditName(profileData?.name || profileData?.username || "Student");
        setEditPhotoURL(profileData?.photoURL || "");
        setIsEditingProfile(true);
    };

    const actualName = profileData?.name || profileData?.username || user?.displayName || "Student";
    
    const getScore = (skill: string, defaultScore: number) => {
        const items = activities[skill];
        if (items && items.length > 0) {
            for (const item of items) {
                const s = parseFloat(item.score || item.band);
                if (!isNaN(s) && s >= 100) {
                    return Math.round(s);
                }
            }
        }
        return defaultScore;
    };

    const studentData = {
        profile: {
            name: actualName,
            candidateNumber: profileData?.studentId || "1029384756",
            initials: actualName.substring(0, 2).toUpperCase(),
            photoURL: profileData?.photoURL
        },
        scores: { 
            reading: getScore('reading', 151), 
            writing: getScore('writing', 146), 
            listening: getScore('listening', 133), 
            speaking: getScore('speaking', 160) 
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">Loading...</div>;
    }

    const overallScore = calculateCambridgeScore(studentData.scores);
    


    const handleDeleteActivity = (type: string, index: number) => {
        
        
        const newActivities = { ...activities };
        newActivities[type] = newActivities[type].filter((_: any, i: number) => i !== index);
        setActivities(newActivities);
        saveActivitiesToFirestore(newActivities);
    };



    const handleAddOffline = (type: string) => {
        setOfflineType(type);
        setOfflineForm({ name: '', link: '', score: '', correct: '', time: '', date: new Date().toISOString().split('T')[0], feedback: '' });
        setShowAddOffline(true);
    };

    const submitOfflineEntry = () => {
        const entryDate = offlineForm.date ? new Date(offlineForm.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const newEntry = {
            name: offlineForm.name || "Offline Entry",
            link: offlineForm.link || "",
            score: offlineForm.score || "0",
            correct: offlineForm.correct || "-",
            time: offlineForm.time || "-",
            date: entryDate,
            band: offlineForm.score,
            words: offlineForm.correct,
            feedback: offlineForm.feedback || ""
        };

        const typeLower = offlineType.toLowerCase();
        const newActivities = { ...activities };
        newActivities[typeLower] = [newEntry, ...newActivities[typeLower]];
        setActivities(newActivities);
        saveActivitiesToFirestore(newActivities);
        
        setShowAddOffline(false);
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-12">
            <style>{`
                @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            <main className="p-4 md:p-8 max-w-6xl mx-auto w-full pt-8">
                <HeroSection data={studentData} isAdmin={isAdmin} onEditProfile={handleOpenEdit} />
                
                <CambridgeClassicProfile 
                    scores={studentData.scores} 
                    overallScore={overallScore} 
                    gradeInfo={getGradeDetails(overallScore)} 
                />
                


                <div className="mt-10 animate-[slideUp_0.5s_ease-out_forwards] opacity-0 pb-20" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                    <SpeakingActivity isAdmin={isAdmin} data={speakingData} onDelete={handleDeleteActivity} onAddOffline={handleAddOffline} onViewFeedback={setViewFeedbackItem} />
                    <TableActivity type="Reading" title="Reading Activity" Icon={BookOpen} colorClass="text-blue-800" data={readingData} isAdmin={isAdmin} onDelete={handleDeleteActivity} onAddOffline={handleAddOffline} />
                    <TableActivity type="Listening" title="Listening Activity" Icon={Headphones} colorClass="text-green-700" data={listeningData} isAdmin={isAdmin} onDelete={handleDeleteActivity} onAddOffline={handleAddOffline} />
                    <WritingActivity isAdmin={isAdmin} data={writingData} onDelete={handleDeleteActivity} onAddOffline={handleAddOffline} onViewFeedback={setViewFeedbackItem} />
                    
                    <div className="mt-16 bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100">
                        <PETCalculator />
                    </div>
                </div>

                
                {showAddOffline && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-0">
                        <div className="bg-white rounded-2xl w-full h-full max-w-none max-h-none rounded-none p-4 md:p-8 flex flex-col shadow-xl relative animate-[slideUp_0.3s_ease-out_forwards]">
                            <button 
                                onClick={() => setShowAddOffline(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Add Offline {offlineType} Entry</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Test Name</label>
                                    <input 
                                        type="text"
                                        value={offlineForm.name}
                                        onChange={(e) => setOfflineForm({...offlineForm, name: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Paper Practice 1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Link (e.g. Google Drive)</label>
                                    <input 
                                        type="url"
                                        value={offlineForm.link}
                                        onChange={(e) => setOfflineForm({...offlineForm, link: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://drive.google.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                                    <input 
                                        type="date"
                                        value={offlineForm.date}
                                        onChange={(e) => setOfflineForm({...offlineForm, date: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Feedback / Notes (Optional)</label>
                                    <textarea 
                                        value={offlineForm.feedback || ''}
                                        onChange={(e) => setOfflineForm({...offlineForm, feedback: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                        placeholder="Add any teacher feedback or personal notes here..."
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-4 flex-1 overflow-y-auto min-h-0">
                                <PETCalculator 
                                    initialTab={offlineType.toLowerCase()} 
                                    hideTabs={true} 
                                    hideHeader={true}
                                    onScaleScoreChange={(score, raw) => {
                                        setOfflineForm(prev => ({
                                            ...prev,
                                            score: score.toString(),
                                            correct: typeof raw === 'number' ? raw.toString() : raw
                                        }));
                                    }}
                                />
                            </div>
                            
                            <div className="mt-8 flex justify-end gap-3">
                                <button 
                                    onClick={() => setShowAddOffline(false)}
                                    className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={submitOfflineEntry}
                                    className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Add Entry
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isEditingProfile && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-[slideUp_0.3s_ease-out_forwards]">
                            <button 
                                onClick={() => setIsEditingProfile(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Edit Profile</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Student Name</label>
                                    <input 
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Profile Image URL</label>
                                    <input 
                                        type="text"
                                        value={editPhotoURL}
                                        onChange={(e) => setEditPhotoURL(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Paste a link to an image to update the profile picture.</p>
                                </div>
                            </div>
                            
                            <div className="mt-8 flex justify-end gap-3">
                                <button 
                                    onClick={() => setIsEditingProfile(false)}
                                    className="px-5 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveProfile}
                                    className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feedback Modal */}
                {viewFeedbackItem && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative animate-[slideUp_0.3s_ease-out_forwards]">
                            <button 
                                onClick={() => setViewFeedbackItem(null)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Feedback: {viewFeedbackItem.name}</h2>
                            <p className="text-sm text-slate-500 mb-6">Score: {viewFeedbackItem.score} • {viewFeedbackItem.date}</p>
                            
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-slate-700 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                                {viewFeedbackItem.feedback || viewFeedbackItem.aiFeedback || viewFeedbackItem.teacherComment || "No feedback provided for this activity."}
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button 
                                    onClick={() => setViewFeedbackItem(null)}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
