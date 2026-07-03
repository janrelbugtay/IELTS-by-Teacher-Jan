import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { format } from 'date-fns';


const getFallbackType = (id: any) => {
  const numId = parseInt(String(id));
  if (!isNaN(numId)) {
    if (numId % 4 === 1) return 'reading';
    if (numId % 4 === 2) return 'listening';
    if (numId % 4 === 3) return 'writing';
    if (numId % 4 === 0) return 'speaking';
  }
  return 'unknown';
};

export function PerformanceTable({ submissions, assignments, currentTab }: any) {
  // We can filter by type based on the currentTab, or just show the specific tab
  // If currentTab is overview, we can show "ALL" or just one of them.
  // The prompt says "In user's dashboard remove the my Practice Assignments. Replace with Performance Table"
  // So we probably want to filter by the active tab if it's not overview, or just show reading/listening if it's overview?
  // Let's create a filter
  
  const [filterType, setFilterType] = useState('listening');

  const data = useMemo(() => {
    // Filter and sort submissions
    const filtered = submissions.filter((sub: any) => {
      const type = sub.assignmentType || assignments.find((a: any) => a.id === sub.assignmentId)?.type || (getFallbackType(sub.assignmentId));
      return type === filterType;
    }).sort((a: any, b: any) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));

    return filtered.map((sub: any, index: number) => {
      const type = sub.assignmentType || assignments.find((a: any) => a.id === sub.assignmentId)?.type || (getFallbackType(sub.assignmentId));
      return {
        id: sub.id,
        testType: type.charAt(0).toUpperCase() + type.slice(1),
        date: sub.createdAt ? format(sub.createdAt, 'MM/dd/yyyy') : 'N/A',
        score: sub.bandScore !== undefined && sub.bandScore !== null ? Number(sub.bandScore) : 0,
        name: `Test ${index + 1}`
      };
    });
  }, [submissions, assignments, filterType]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">{filterType.toUpperCase()} PROGRESS</h2>
        <div className="flex gap-2">
          <button onClick={() => setFilterType('listening')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${filterType === 'listening' ? 'bg-[#1E4DB7] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Listening</button>
          <button onClick={() => setFilterType('reading')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${filterType === 'reading' ? 'bg-[#1E4DB7] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Reading</button>
          <button onClick={() => setFilterType('writing')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${filterType === 'writing' ? 'bg-[#1E4DB7] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Writing</button>
          <button onClick={() => setFilterType('speaking')} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${filterType === 'speaking' ? 'bg-[#1E4DB7] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Speaking</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="p-0 overflow-x-auto border-r border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Test Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row: any, i: number) => (
                <tr key={row.id} className={i % 2 === 0 ? 'bg-[#f8fafc]' : 'bg-white'}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.testType}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{row.score > 0 ? row.score.toFixed(1) : '0.0'}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-sm">No tests completed yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 min-h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} tickMargin={10} axisLine={false} tickLine={false} angle={-45} textAnchor="end" />
              <YAxis domain={[0, 9]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Bar dataKey="score" fill="#0EA5E9" radius={[2, 2, 0, 0]} barSize={30}>
                <LabelList dataKey="score" position="top" style={{ fill: '#334155', fontSize: 12, fontWeight: 'bold' }} formatter={(val: number) => val > 0 ? val.toFixed(1) : '0'} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
