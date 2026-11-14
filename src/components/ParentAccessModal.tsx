import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Copy,
  CheckCircle2,
  Download,
  RefreshCw,
  Pause,
  Play,
  Image as ImageIcon,
} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { PUBLIC_WEBSITE_ORIGIN } from '../lib/parentLocale';
import { format } from 'date-fns';

interface ParentAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userProfile: any;
  course?: string;
}

function generateAccessToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  const randomVals = new Uint32Array(12);
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(randomVals);
    for (let i = 0; i < 12; i++) {
      result += chars[randomVals[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 12; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}

export function ParentAccessModal({
  isOpen,
  onClose,
  userId,
  userProfile,
  course = 'IELTS',
}: ParentAccessModalProps) {
  const { isAdmin } = useAuth();
  const [profile, setProfile] = useState<any>(userProfile);
  const [copiedState, setCopiedState] = useState<'link' | 'qr' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const qrCanvasWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    if (!isOpen || !isAdmin || !userId) return;
    const unsub = onSnapshot(doc(db, 'users', userId), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    });
    return () => unsub();
  }, [isOpen, isAdmin, userId]);

  // Automatically initialize parentAccess token if missing (Admin only)
  useEffect(() => {
    if (!isOpen || !isAdmin || !userId || !profile) return;
    if (!profile.parentAccess || !profile.parentAccess.token) {
      const initialConfig = {
        enabled: profile.parentAccess?.enabled ?? true,
        token: generateAccessToken(),
        updatedAt: Date.now(),
        viewCount: profile.parentAccess?.viewCount || 0,
      };
      setDoc(
        doc(db, 'users', userId),
        { parentAccess: initialConfig },
        { merge: true }
      ).catch((err) => {
        console.warn('Could not initialize parent access token:', err);
      });
    }
  }, [isOpen, isAdmin, userId, profile]);

  // Strictly restrict QR management (Save, Copy QR/Link, Pause, Reset) to Admin only
  if (!isOpen || !isAdmin) return null;

  const displayName =
    profile?.nickname ||
    profile?.name ||
    profile?.displayName ||
    profile?.firstName ||
    'Student';
  const studentCourse = (profile?.course || course || 'IELTS').toUpperCase();
  const isEnabled = profile?.parentAccess?.enabled !== false;
  const token = profile?.parentAccess?.token || '';
  const viewCount = Number(profile?.parentAccess?.viewCount || 0);
  const lastViewedAt = profile?.parentAccess?.lastViewedAt;

  let basePath = `/parent/dashboard/${userId}`;
  if (studentCourse === 'PET') basePath = `/parent/pet/dashboard/${userId}`;
  else if (studentCourse === 'KET') basePath = `/parent/ket/dashboard/${userId}`;

  // Always generate links & QR codes from https://eraenglish.online
  const parentUrl = `${PUBLIC_WEBSITE_ORIGIN}${basePath}${
    token ? `?key=${encodeURIComponent(token)}` : ''
  }`;

  const buildBrandedQrCanvas = (): HTMLCanvasElement | null => {
    const sourceCanvas = qrCanvasWrapperRef.current?.querySelector('canvas');
    if (!sourceCanvas) return null;

    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 640;
    cardCanvas.height = 760;
    const ctx = cardCanvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, cardCanvas.width, cardCanvas.height);

    const grad = ctx.createLinearGradient(0, 0, cardCanvas.width, 165);
    grad.addColorStop(0, '#1E3A8A');
    grad.addColorStop(1, '#1E4DB7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cardCanvas.width, 165);

    ctx.fillStyle = '#BFDBFE';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KỶ NGUYÊN ERA · ERAENGLISH.ONLINE', cardCanvas.width / 2, 52);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(displayName, cardCanvas.width / 2, 104);

    ctx.fillStyle = '#DBEAFE';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(`${studentCourse} Progress Report`, cardCanvas.width / 2, 140);

    const qrSize = 380;
    const qrX = (cardCanvas.width - qrSize) / 2;
    const qrY = 215;
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 3;
    ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
    ctx.drawImage(sourceCanvas, qrX, qrY, qrSize, qrSize);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('Scan QR to View Student Progress', cardCanvas.width / 2, 665);

    ctx.fillStyle = '#64748B';
    ctx.font = '17px sans-serif';
    ctx.fillText('eraenglish.online', cardCanvas.width / 2, 704);

    return cardCanvas;
  };

  const handleSaveQr = () => {
    if (!isAdmin) return;
    const cardCanvas = buildBrandedQrCanvas();
    if (!cardCanvas) return;
    const link = document.createElement('a');
    link.download = `${displayName.replace(/\s+/g, '_')}_Parent_QR.png`;
    link.href = cardCanvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyQr = async () => {
    if (!isAdmin) return;
    const cardCanvas = buildBrandedQrCanvas();
    if (!cardCanvas) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        cardCanvas.toBlob((b) => resolve(b), 'image/png')
      );
      if (blob && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopiedState('qr');
        setTimeout(() => setCopiedState(null), 2000);
        return;
      }
    } catch {
      // Fallback to copying the URL if image clipboard is restricted by browser
    }

    await navigator.clipboard.writeText(parentUrl);
    setCopiedState('qr');
    setTimeout(() => setCopiedState(null), 2000);
  };

  const handleCopyLink = () => {
    if (!isAdmin) return;
    navigator.clipboard.writeText(parentUrl);
    setCopiedState('link');
    setTimeout(() => setCopiedState(null), 2000);
  };

  const handleToggleEnabled = async () => {
    if (!isAdmin || !userId) return;
    setIsUpdating(true);
    try {
      await setDoc(
        doc(db, 'users', userId),
        {
          parentAccess: {
            ...profile?.parentAccess,
            enabled: !isEnabled,
            token: token || generateAccessToken(),
            updatedAt: Date.now(),
          },
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to toggle parent access:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!isAdmin || !userId) return;
    setIsUpdating(true);
    try {
      await setDoc(
        doc(db, 'users', userId),
        {
          parentAccess: {
            ...profile?.parentAccess,
            enabled: true,
            token: generateAccessToken(),
            updatedAt: Date.now(),
          },
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to reset parent access link:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-70 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full max-h-[92dvh] overflow-y-auto shadow-2xl border border-slate-100 relative text-slate-800"
      >
        {/* Mobile grab handle */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Compact Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
              Parent QR &amp; Link
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {displayName} <span aria-hidden="true">·</span> {studentCourse}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Pause & Reset Control Row */}
        <div
          className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl border mb-4 ${
            isEnabled ? 'bg-emerald-50/60 border-emerald-200/90' : 'bg-amber-50/80 border-amber-200'
          }`}
        >
          <div className="min-w-0">
            <div className={`text-xs font-bold ${isEnabled ? 'text-emerald-800' : 'text-amber-800'}`}>
              {isEnabled ? 'Link Active' : 'Link Paused'}
            </div>
            <div className="text-[11px] text-slate-500 truncate tabular-nums">
              {viewCount > 0 && lastViewedAt
                ? `Opened ${viewCount}x · ${format(new Date(lastViewedAt), 'MMM d, h:mm a')}`
                : 'No parent visits yet'}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleToggleEnabled}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isEnabled
                  ? 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                  : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isEnabled ? 'Pause' : 'Resume'}</span>
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleRegenerate}
              title="Reset QR code & generate new link"
              className="min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* QR Code Area */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-4 flex flex-col items-center">
          <div
            className={`p-3.5 bg-white rounded-2xl border border-slate-200 transition-opacity ${
              isEnabled ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <QRCodeSVG
              value={parentUrl}
              size={188}
              level="M"
              bgColor="#FFFFFF"
              fgColor="#0F172A"
            />
          </div>

          {/* Offscreen high-res canvas for Save QR & Copy QR */}
          <div ref={qrCanvasWrapperRef} className="hidden" aria-hidden="true">
            <QRCodeCanvas
              value={parentUrl}
              size={512}
              level="M"
              bgColor="#FFFFFF"
              fgColor="#0F172A"
            />
          </div>

          {/* Admin Save QR & Copy QR Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 w-full">
            <button
              type="button"
              onClick={handleSaveQr}
              className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#1E4DB7] hover:bg-blue-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Save QR</span>
            </button>
            <button
              type="button"
              onClick={handleCopyQr}
              className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {copiedState === 'qr' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">QR Copied</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-slate-600" />
                  <span>Copy QR</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Website Link (https://eraenglish.online) */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-semibold text-slate-500">eraenglish.online Link</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-bold text-[#1E4DB7] hover:bg-blue-50 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {copiedState === 'link' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
          <div
            onClick={handleCopyLink}
            title="Click to copy link"
            className="text-xs font-mono text-slate-700 bg-slate-50 hover:bg-slate-100/80 px-3.5 py-2.5 rounded-xl border border-slate-200 truncate cursor-pointer transition-colors"
          >
            {parentUrl}
          </div>
        </div>
      </div>
    </div>
  );
}
