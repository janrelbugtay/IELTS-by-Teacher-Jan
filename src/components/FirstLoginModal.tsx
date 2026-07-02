import React, { useState } from 'react';
import { updatePassword, User } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Shield, CheckCircle2, Lock, Smartphone, Mail, AlertTriangle } from 'lucide-react';

interface FirstLoginModalProps {
  user: User;
  userProfile: any;
  onComplete: () => void;
}

export function FirstLoginModal({ user, userProfile, onComplete }: FirstLoginModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('What was the name of your first pet?');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!securityAnswer) {
      setError('Please provide an answer to the security question.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Update Password in Firebase Auth if it's a real user
      if (!(user as any).customAuth) {
        try {
          await updatePassword(user, newPassword);
        } catch (authErr) {
          console.warn("Could not update auth password", authErr);
        }
      }

      // 2. Update Firestore User Document
      await updateDoc(doc(db, 'users', user.uid), {
        needsPasswordReset: false,
        password: newPassword, // Update the custom password field
        securityQuestion,
        securityAnswer,
        phone,
        email
      });

      onComplete();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete setup. You might need to log out and log back in to change your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col items-center text-center bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Shield className="w-32 h-32" />
          </div>
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm relative z-10">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 relative z-10">Welcome to ERA!</h2>
          <p className="text-sm text-slate-500 mt-2 relative z-10">Please complete your account setup to continue.</p>
        </div>

        <div className="p-8 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                <Lock className="w-4 h-4 text-slate-400" /> Security
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">New Password <span className="text-red-500">*</span></label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="At least 6 characters" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Confirm Password <span className="text-red-500">*</span></label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Must match new password" />
              </div>
              
              <div className="space-y-1.5 pt-2">
                <label className="text-sm font-bold text-slate-700">Security Question <span className="text-red-500">*</span></label>
                <select value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium">
                  <option>What was the name of your first pet?</option>
                  <option>In what city were you born?</option>
                  <option>What is your mother's maiden name?</option>
                  <option>What high school did you attend?</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Answer <span className="text-red-500">*</span></label>
                <input type="text" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Your answer" />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                <Smartphone className="w-4 h-4 text-slate-400" /> Contact Info
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Email Address (Optional)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="john@example.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Phone Number (Optional)</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="+1234567890" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-[#1E4DB7] text-white text-base font-bold rounded-xl shadow-md hover:bg-blue-800 transition-colors disabled:opacity-70 mt-6 flex items-center justify-center gap-2">
              {loading ? 'Saving...' : <><CheckCircle2 className="w-5 h-5" /> Complete Setup</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
