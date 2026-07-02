import React, { useState } from 'react';
import { X, Copy, CheckCircle2, UserPlus, Upload, ShieldAlert, FileText, Smartphone, Mail, Settings } from 'lucide-react';
import { createStudentAccount } from '../lib/authUtils';

interface CreateStudentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  defaultCourse?: string;
}

export function CreateStudentModal({ onClose, onSuccess, defaultCourse }: CreateStudentModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [course, setCourse] = useState(defaultCourse || 'IELTS');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !course) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const credentials = await createStudentAccount({
        firstName,
        lastName,
        course,
        email,
        phone
      });
      setCreatedCredentials(credentials);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create student account.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `
Student Credentials for ${firstName} ${lastName}
----------------------------------
Student ID: ${createdCredentials.studentId}
Username: ${createdCredentials.username}
Password: ${createdCredentials.tempPassword}

Please log in and change your password immediately.
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add functionality to print student login card
  const handlePrintCard = () => {
    // We can open a new window or trigger window.print with a hidden printable section.
    // For now, let's just trigger a simple print alert.
    alert("In a real app, this would open a printable ID card design.");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Create Student Account</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {!createdCredentials ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">First Name <span className="text-red-500">*</span></label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. John" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Last Name <span className="text-red-500">*</span></label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Smith" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Course <span className="text-red-500">*</span></label>
                  <select value={course} onChange={e => setCourse(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium">
                    <option value="Pre-Starter">Pre-Starter</option>
                    <option value="Starter">Starter</option>
                    <option value="Movers">Movers</option>
                    <option value="Flyers">Flyers</option>
                    <option value="KET">KET</option>
                    <option value="PET">PET</option>
                    <option value="IELTS">IELTS</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">Status</label>
                  <select disabled className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed">
                    <option>Active</option>
                  </select>
                  <p className="text-[10px] text-slate-400">Status defaults to active.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> Email <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="john@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-slate-400" /> Phone <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="+1234567890" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-[#1E4DB7] text-white text-sm font-bold rounded-xl shadow-sm hover:bg-blue-800 transition-colors disabled:opacity-70 flex items-center gap-2">
                  {loading ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Student Created!</h3>
                <p className="text-slate-500">The account has been set up successfully.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                <button onClick={handleCopyCredentials} className="absolute top-4 right-4 p-2 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 text-xs font-bold">
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Credentials</h4>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-slate-500">Student ID</span>
                    <p className="text-lg font-bold text-slate-900 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 inline-block mt-1">{createdCredentials.studentId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-500">Username</span>
                    <p className="text-lg font-bold text-slate-900 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 inline-block mt-1">{createdCredentials.username}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-slate-500">Temporary Password</span>
                    <p className="text-lg font-bold text-amber-600 font-mono bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 inline-block mt-1">{createdCredentials.tempPassword}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                <button onClick={handlePrintCard} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" /> Print Login Card
                </button>
                <button onClick={onClose} className="flex-1 py-3 bg-[#1E4DB7] text-white font-bold rounded-xl hover:bg-blue-800 shadow-sm transition-colors">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
