import React, { useMemo, useState } from 'react';
import {
    Award,
    BookOpen,
    Check,
    CheckCircle2,
    Copy,
    Edit3,
    FileCheck2,
    AlertTriangle,
    RefreshCw,
    Sparkles,
    XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function formatWritingReportMarkdown(taskNum: number, d: any): string {
    if (!d || typeof d !== 'object') return '';

    return `### Task ${taskNum} Evaluation
**Overall Band Score:** ${d.scores?.overallBand || 'N/A'}

**Task Achievement / Response:** ${d.scores?.taskAchievement || 'N/A'}
*${d.feedback?.taskAchievement || ''}*

**Coherence and Cohesion:** ${d.scores?.coherenceCohesion || 'N/A'}
*${d.feedback?.coherenceCohesion || ''}*

**Lexical Resource:** ${d.scores?.lexicalResource || 'N/A'}
*${d.feedback?.lexicalResource || ''}*

**Grammatical Range and Accuracy:** ${d.scores?.grammaticalRange || 'N/A'}
*${d.feedback?.grammaticalRange || ''}*

#### Corrected Answer (Band 8.0)
${d.finalCorrectedAnswer || ''}

#### Error Marking
${d.inlineMarkedEssay || ''}
`;
}

function countWords(text?: unknown): number {
    if (typeof text !== 'string' || !text.trim()) return 0;
    const stripped = text.replace(/<[^>]+>/g, ' ').trim();
    return stripped ? stripped.split(/\s+/).filter(Boolean).length : 0;
}

function formatInlineMarkedHtml(raw?: unknown): string {
    if (typeof raw !== 'string' || !raw.trim()) {
        return '<p class="text-slate-500 italic">No inline markings available.</p>';
    }

    let html = raw.trim();

    // Normalize legacy markdown strikethrough / bold if a report was stored in markdown form
    if (!/<del/i.test(html) && /~~.*?~~/.test(html)) {
        html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
    }
    if (!/<ins/i.test(html) && /\*\*(.*?)\*\*/.test(html) && /<del/i.test(html)) {
        html = html.replace(/\*\*(.*?)\*\*/g, '<ins>$1</ins>');
    }

    // Apply consistent dual-coded semantic styling to all <del> and <ins> tags
    html = html.replace(
        /<del([^>]*)>/gi,
        `<del class="bg-rose-50 text-rose-700 line-through decoration-rose-500 decoration-2 px-1 py-0.5 rounded mx-0.5">`
    );
    html = html.replace(
        /<ins([^>]*)>/gi,
        `<ins class="bg-emerald-50 text-emerald-800 font-semibold no-underline px-1.5 py-0.5 rounded border-b-2 border-emerald-400 mx-0.5">`
    );

    // Ensure paragraph breaks if plain text with newlines
    if (!/<p[\s>]/i.test(html)) {
        const paragraphs = html.split(/\n{2,}|\n/).map(p => p.trim()).filter(Boolean);
        html = paragraphs.map(p => `<p class="mb-4 last:mb-0">${p}</p>`).join('');
    } else {
        html = html.replace(/<p([^>]*)>/gi, '<p class="mb-4 last:mb-0">');
    }

    return html;
}

export interface WritingExaminerReportCardProps {
    taskNum: number;
    text?: string;
    report: any;
    onReevaluate?: () => void;
    onReportEdited?: (taskNum: number, newReport: any) => void | Promise<void>;
    onSaveInlineFinalAnswer?: (taskNum: number, newText: string) => void | Promise<void>;
}

export const WritingExaminerReportCard: React.FC<WritingExaminerReportCardProps> = ({
    taskNum,
    text = '',
    report,
    onReevaluate,
    onReportEdited,
    onSaveInlineFinalAnswer
}) => {
    const { isAdmin } = useAuth();
    const [isEditingReport, setIsEditingReport] = useState(false);
    const [editedReport, setEditedReport] = useState<any>(null);
    const [inlineEditingFinalAnswer, setInlineEditingFinalAnswer] = useState(false);
    const [inlineFinalAnswerText, setInlineFinalAnswerText] = useState('');
    const [copiedFinal, setCopiedFinal] = useState(false);

    const taLabel = taskNum === 1 ? 'Task Achievement' : 'Task Response';

    const formattedInlineHtml = useMemo(
        () => formatInlineMarkedHtml(report?.inlineMarkedEssay),
        [report?.inlineMarkedEssay]
    );

    const inlineEditCount = useMemo(() => {
        if (typeof report?.inlineMarkedEssay !== 'string') return 0;
        const delMatches = report.inlineMarkedEssay.match(/<del[^>]*>|~~.*?~~/gi);
        return delMatches ? delMatches.length : 0;
    }, [report?.inlineMarkedEssay]);

    if (!report || !report.scores || !report.feedback) return null;

    const rawNotice = typeof report.notice === 'string' ? report.notice : '';
    const displayNotice =
        rawNotice && !rawNotice.toLowerCase().includes('credits depleted')
            ? rawNotice
            : 'Criterion-Referenced Band Evaluation';

    const overallBand = (parseFloat(report.scores?.overallBand) || 0).toFixed(1);
    const taScore = (parseFloat(report.scores?.taskAchievement) || 0).toFixed(1);
    const ccScore = (parseFloat(report.scores?.coherenceCohesion) || 0).toFixed(1);
    const lrScore = (parseFloat(report.scores?.lexicalResource) || 0).toFixed(1);
    const grScore = (parseFloat(report.scores?.grammaticalRange) || 0).toFixed(1);

    const originalWordCount = countWords(text);
    const correctedWordCount = countWords(report.finalCorrectedAnswer);

    const handleCopyFinalAnswer = async () => {
        try {
            await navigator.clipboard.writeText(report.finalCorrectedAnswer || '');
            setCopiedFinal(true);
            setTimeout(() => setCopiedFinal(false), 2000);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    const handleSaveInlineClick = async () => {
        try {
            if (onSaveInlineFinalAnswer) {
                await onSaveInlineFinalAnswer(taskNum, inlineFinalAnswerText);
            } else if (onReportEdited) {
                const updated = { ...report, finalCorrectedAnswer: inlineFinalAnswerText };
                await onReportEdited(taskNum, updated);
            }
            setInlineEditingFinalAnswer(false);
        } catch (err) {
            console.error('Failed to save final answer', err);
        }
    };

    const handleSaveFullEdit = async () => {
        try {
            if (onReportEdited) {
                await onReportEdited(taskNum, editedReport);
            }
            setIsEditingReport(false);
        } catch (err) {
            console.error('Failed to save edited report', err);
        }
    };

    const cleanParagraphs = String(report.finalCorrectedAnswer || '')
        .replace(/<del[^>]*>.*?<\/del>/gi, '')
        .replace(/<ins[^>]*>(.*?)<\/ins>/gi, '$1')
        .replace(/<\/?p[^>]*>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .split(/\n{2,}|\n/)
        .map(p => p.trim())
        .filter(Boolean);

    return (
        <div
            className="ai-report bg-white rounded-2xl shadow-xl mt-8 overflow-hidden border border-slate-200 text-slate-900"
            style={{ width: '190mm', maxWidth: '100%', margin: '0 auto', pageBreakAfter: 'always', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            {/* Institutional Official Examiner Header */}
            <div className="bg-[#0F172A] text-white px-6 py-6 md:px-8 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        IELTS Academic Writing &middot; Task {taskNum} Assessment
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                        Official IELTS Examiner Report
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300">
                        <span>{displayNotice}</span>
                        <span className="text-slate-600">&bull;</span>
                        <span className="text-emerald-300 font-medium">
                            Target Rewrite: Band {report.targetBand || '8.0'}
                        </span>
                    </div>
                    {isAdmin && (
                        <div className="flex flex-wrap items-center gap-2 pt-3 print-hidden">
                            <button
                                type="button"
                                onClick={() => {
                                    const copy = JSON.parse(JSON.stringify(report));
                                    setEditedReport(copy);
                                    setIsEditingReport(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Report</span>
                            </button>
                            {onReevaluate && (
                                <button
                                    type="button"
                                    onClick={onReevaluate}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>Re-evaluate</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Crisp Overall Band Scorecard */}
                <div className="shrink-0 bg-slate-800/90 border border-slate-700 rounded-xl px-6 py-3.5 text-center min-w-[132px]">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Overall Band
                    </div>
                    <div
                        className="text-4xl font-bold text-amber-300 tracking-tight mt-0.5"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: 'tabular-nums' }}
                    >
                        {overallBand}
                    </div>
                </div>
            </div>

            {isEditingReport && editedReport ? (
                <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-200 text-left space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-lg font-bold text-slate-900">Edit Examiner Report (Task {taskNum})</h3>
                        <button
                            type="button"
                            onClick={() => setIsEditingReport(false)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                            Close
                        </button>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Band Scores</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                { key: 'overallBand', label: 'Overall Band' },
                                { key: 'taskAchievement', label: taLabel },
                                { key: 'coherenceCohesion', label: 'Coherence & Cohesion' },
                                { key: 'lexicalResource', label: 'Lexical Resource' },
                                { key: 'grammaticalRange', label: 'Grammatical Range' }
                            ].map(item => (
                                <div key={item.key}>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">{item.label}</label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="9"
                                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:border-slate-900 outline-none"
                                        value={editedReport.scores?.[item.key] || ''}
                                        onChange={e =>
                                            setEditedReport({
                                                ...editedReport,
                                                scores: { ...editedReport.scores, [item.key]: e.target.value }
                                            })
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { key: 'taskAchievement', label: `${taLabel} Feedback` },
                            { key: 'coherenceCohesion', label: 'Coherence & Cohesion Feedback' },
                            { key: 'lexicalResource', label: 'Lexical Resource Feedback' },
                            { key: 'grammaticalRange', label: 'Grammatical Range Feedback' }
                        ].map(item => (
                            <div key={item.key}>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">{item.label}</label>
                                <textarea
                                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg h-24 text-sm focus:border-slate-900 outline-none"
                                    value={editedReport.feedback?.[item.key] || ''}
                                    onChange={e =>
                                        setEditedReport({
                                            ...editedReport,
                                            feedback: { ...editedReport.feedback, [item.key]: e.target.value }
                                        })
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Inline Marked Essay (HTML &lt;del&gt;/&lt;ins&gt;)
                        </label>
                        <textarea
                            className="w-full p-3 bg-white border border-slate-300 rounded-lg h-32 font-mono text-xs focus:border-slate-900 outline-none"
                            value={editedReport.inlineMarkedEssay || ''}
                            onChange={e => setEditedReport({ ...editedReport, inlineMarkedEssay: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Final Corrected Answer (Band {editedReport.targetBand || '8.0'})
                        </label>
                        <textarea
                            className="w-full p-3 bg-white border border-slate-300 rounded-lg h-40 text-sm leading-relaxed focus:border-slate-900 outline-none"
                            value={editedReport.finalCorrectedAnswer || ''}
                            onChange={e => setEditedReport({ ...editedReport, finalCorrectedAnswer: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditingReport(false)}
                            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveFullEdit}
                            className="px-5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-sm font-semibold rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                        >
                            Save Report Changes
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-6 md:p-8 space-y-8 bg-[#F8FAFC]">
                    {/* Section 1: Criterion Band Scores & Examiner Feedback */}
                    <section>
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-4">
                            <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Award className="w-5 h-5 text-slate-700" />
                                <span>1. Criterion Band Scores &amp; Examiner Feedback</span>
                            </h3>
                            <span
                                className="text-xs font-medium text-slate-500"
                                style={{ fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: 'tabular-nums' }}
                            >
                                4 Official Criteria
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: taLabel, score: taScore, body: report.feedback?.taskAchievement },
                                { label: 'Coherence & Cohesion', score: ccScore, body: report.feedback?.coherenceCohesion },
                                { label: 'Lexical Resource', score: lrScore, body: report.feedback?.lexicalResource },
                                { label: 'Grammatical Range & Accuracy', score: grScore, body: report.feedback?.grammaticalRange }
                            ].map(item => (
                                <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-3 mb-2.5">
                                            <h4 className="font-bold text-sm text-slate-900">{item.label}</h4>
                                            <span
                                                className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-bold text-sm shrink-0"
                                                style={{ fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                {item.score}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            {typeof item.body === 'string' ? item.body : item.body ? String(item.body) : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 2: Key Strengths & Priority Improvements */}
                    {((Array.isArray(report.keyStrengths) && report.keyStrengths.length > 0) ||
                        (Array.isArray(report.keyWeaknesses) && report.keyWeaknesses.length > 0)) && (
                        <section>
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-4">
                                <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-slate-700" />
                                    <span>2. Strengths &amp; Priority Improvements</span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5">
                                    <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-2 mb-3">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Key Strengths</span>
                                    </h4>
                                    <ul className="space-y-2 text-sm text-slate-700">
                                        {(Array.isArray(report.keyStrengths) ? report.keyStrengths : []).map((s: unknown, i: number) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                                                <span>{typeof s === 'string' ? s : String(s ?? '')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-5">
                                    <h4 className="font-bold text-sm text-rose-900 flex items-center gap-2 mb-3">
                                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                        <span>Priority Improvements</span>
                                    </h4>
                                    <ul className="space-y-2 text-sm text-slate-700">
                                        {(Array.isArray(report.keyWeaknesses) ? report.keyWeaknesses : []).map((w: unknown, i: number) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-2 shrink-0" />
                                                <span>{typeof w === 'string' ? w : String(w ?? '')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Section 3: Error Marking */}
                    <section className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2.5">
                            <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                                <FileCheck2 className="w-5 h-5 text-slate-700" />
                                <span>3. Error Marking</span>
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                                <span className="inline-flex items-center gap-1.5 text-rose-700 font-medium">
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span className="line-through">Error Removed</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Correction Inserted</span>
                                </span>
                                <span
                                    className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-semibold"
                                    style={{ fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {inlineEditCount} edits
                                </span>
                            </div>
                        </div>

                        {/* Inline Annotated Essay */}
                        <div className="bg-[#FDFCFB] border border-slate-200 rounded-xl p-6 md:p-7">
                            <div
                                className="text-[16px] leading-[1.9] text-slate-800"
                                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                                dangerouslySetInnerHTML={{ __html: formattedInlineHtml }}
                            />
                        </div>
                    </section>

                    {/* Section 4: Final Corrected Answer (Band 8.0) */}
                    <section>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2.5 mb-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-emerald-700" />
                                    <span>4. Final Corrected Answer</span>
                                </h3>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold whitespace-nowrap">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Band {report.targetBand || '8.0'} Model Rewrite
                                </span>
                            </div>

                            <div className="flex items-center gap-2 print-hidden">
                                {!inlineEditingFinalAnswer && (
                                    <button
                                        type="button"
                                        onClick={handleCopyFinalAnswer}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                                    >
                                        {copiedFinal ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                <span className="text-emerald-700">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" />
                                                <span>Copy Essay</span>
                                            </>
                                        )}
                                    </button>
                                )}
                                {isAdmin && !inlineEditingFinalAnswer && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInlineEditingFinalAnswer(true);
                                            setInlineFinalAnswerText(report.finalCorrectedAnswer || '');
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {inlineEditingFinalAnswer ? (
                            <div className="bg-white border border-slate-300 rounded-xl p-4 space-y-3">
                                <textarea
                                    className="w-full p-4 border border-slate-200 rounded-lg h-64 text-[15px] leading-relaxed focus:border-slate-900 outline-none"
                                    style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                                    value={inlineFinalAnswerText}
                                    onChange={e => setInlineFinalAnswerText(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setInlineEditingFinalAnswer(false)}
                                        className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveInlineClick}
                                        className="px-4 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                                    >
                                        Save Rewrite
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-7">
                                <div className="text-xs text-emerald-800 font-medium mb-4 pb-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                    <span>Preserves student&apos;s original ideas while elevating grammar, lexis, and cohesion to IELTS Band {report.targetBand || '8.0'}.</span>
                                    <span
                                        className="text-slate-500"
                                        style={{ fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: 'tabular-nums' }}
                                    >
                                        {originalWordCount > 0 ? `Original: ${originalWordCount}w · ` : ''}
                                        Band {report.targetBand || '8.0'}: {correctedWordCount}w
                                    </span>
                                </div>
                                <div
                                    className="space-y-4 text-[16px] leading-[1.9] text-slate-900"
                                    style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                                >
                                    {cleanParagraphs.length > 0 ? (
                                        cleanParagraphs.map((para, idx) => <p key={idx}>{para}</p>)
                                    ) : (
                                        <p className="text-slate-500 italic">No corrected answer available.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export const WritingPerformanceReport = ({
    taskNum,
    text,
    report,
    loadingReport,
    errorText,
    candidateName,
    onReevaluate,
    onReportEdited,
    onSaveInlineFinalAnswer
}: any) => {
    const { isAdmin } = useAuth();
    const name = candidateName || 'CANDIDATE';
    const [candNo] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear());
    const redBarText = `Writing Task ${taskNum} \u00A0 \u00A0 \u00A0 `.repeat(10);

    return (
        <div className="w-full max-w-4xl flex flex-col items-center mb-12">
            <div
                className="answer-sheet relative bg-white p-8 md:p-12 border border-gray-300 w-full shrink-0"
                style={{
                    width: '210mm',
                    minHeight: '297mm',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    pageBreakAfter: 'always'
                }}
            >
                <div className="text-center font-bold text-2xl mb-6 mt-4">IELTS Writing Answer Sheet - TASK {taskNum}</div>

                <div className="border-2 border-black mb-4 flex flex-col text-sm font-sans text-black">
                    <div className="flex border-b-2 border-black">
                        <div className="p-2 w-32 border-r-2 border-black font-bold flex items-center">Candidate<br />Name</div>
                        <div className="p-2 flex-1 font-mono text-xl tracking-widest flex items-center">{name}</div>
                    </div>
                    <div className="flex border-b-2 border-black">
                        <div className="p-2 w-32 border-r-2 border-black font-bold flex items-center">Candidate<br />No.</div>
                        <div className="p-2 flex-1 font-mono text-lg tracking-[0.5em] flex items-center">{candNo}</div>
                        <div className="p-2 w-24 border-x-2 border-black font-bold flex items-center">Centre<br />No.</div>
                        <div className="p-2 w-40"></div>
                    </div>
                    <div className="flex">
                        <div className="p-2 w-32 border-r-2 border-black font-bold flex items-center">Test<br />Module</div>
                        <div className="p-2 flex-1 flex items-center space-x-6">
                            <label className="flex items-center">
                                <input type="checkbox" defaultChecked disabled className="mr-2 w-4 h-4" /> Academic
                            </label>
                        </div>
                        <div className="p-2 w-24 border-x-2 border-black font-bold flex items-center justify-center">Test Date</div>
                        <div className="p-2 flex items-center space-x-3 font-mono">
                            <div className="flex flex-col items-center">
                                <span className="border border-gray-500 px-3 py-1 text-base">{day}</span>
                                <span className="text-[10px] mt-1 font-sans">Day</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="border border-gray-500 px-3 py-1 text-base">{month}</span>
                                <span className="text-[10px] mt-1 font-sans">Month</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="border border-gray-500 px-3 py-1 text-base">{year}</span>
                                <span className="text-[10px] mt-1 font-sans">Year</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#ff3333] text-white font-bold text-center overflow-hidden whitespace-nowrap py-1.5 mb-2 text-base tracking-widest">
                    {redBarText}
                </div>

                <div
                    className="font-mono text-[15px] leading-8 text-gray-800 whitespace-pre-wrap mt-8 pt-4 pb-12 border-t border-gray-300 relative px-4"
                    style={{
                        backgroundImage: 'linear-gradient(transparent 95%, #cbd5e1 95%)',
                        backgroundSize: '100% 32px',
                        minHeight: '200mm'
                    }}
                >
                    {text}
                    {(!text || text.trim() === '') && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 text-2xl font-sans italic rotate-[-45deg] pointer-events-none">
                            NO ANSWER PROVIDED
                        </div>
                    )}
                </div>

                <div className="mt-8 border-t-2 border-black pt-2 flex justify-between text-xs font-bold text-gray-600">
                    <div>EXAMINER USE ONLY</div>
                    <div>EXAMINER 2 NUMBER: &nbsp; _______________</div>
                </div>
            </div>

            {loadingReport && (
                <div className="w-full flex justify-center mt-12 print-hidden">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex items-center space-x-4 animate-pulse">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">AI Examiner is grading Task {taskNum}...</h3>
                            <p className="text-slate-500 text-sm">Analyzing task achievement, coherence, lexical resource, and grammar.</p>
                        </div>
                    </div>
                </div>
            )}

            {errorText && (
                <div className="w-full mt-8 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl shadow-sm print-hidden">
                    <h3 className="font-bold">Evaluation Error (Task {taskNum})</h3>
                    <p className="text-sm mt-1">{errorText}</p>
                    <button
                        type="button"
                        onClick={onReevaluate}
                        className="mt-2 text-xs bg-rose-100 px-3 py-1.5 rounded-lg font-bold hover:bg-rose-200 cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {report && !loadingReport && (
                <WritingExaminerReportCard
                    taskNum={taskNum}
                    text={text}
                    report={report}
                    onReevaluate={onReevaluate}
                    onReportEdited={onReportEdited}
                    onSaveInlineFinalAnswer={onSaveInlineFinalAnswer}
                />
            )}

            {!report && !loadingReport && isAdmin && (
                <div className="w-full flex justify-center mt-8 print-hidden">
                    <button
                        type="button"
                        onClick={onReevaluate}
                        className="bg-[#0F172A] hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold shadow-xl transition-all flex items-center space-x-3 cursor-pointer border border-slate-700"
                    >
                        <Sparkles className="w-5 h-5 text-amber-300" />
                        <span className="text-base tracking-wide">Generate Official Report &mdash; Task {taskNum}</span>
                    </button>
                </div>
            )}
        </div>
    );
};
