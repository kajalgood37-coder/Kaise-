import React, { useState } from 'react';
import {
  X,
  Mic,
  MicOff,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Lock,
  Smartphone,
  Chrome,
  Apple,
  Laptop,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { PriyaPortrait } from './PriyaPortrait';
import { AvatarLookStyle } from '../types';

interface MicPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => Promise<void>;
  onOpenTextChat: () => void;
  avatarLook?: AvatarLookStyle;
}

export const MicPermissionModal: React.FC<MicPermissionModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  onOpenTextChat,
  avatarLook = 'royal-gold',
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryStatus, setRetryStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [activeTab, setActiveTab] = useState<'chrome' | 'ios' | 'desktop'>('chrome');

  if (!isOpen) return null;

  const handleRetryPermission = async () => {
    setIsRetrying(true);
    setRetryStatus('idle');
    try {
      await onRetry();
      setRetryStatus('success');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('[MicPermissionModal] Retry failed:', err);
      setRetryStatus('failed');
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-950/95 border-2 border-amber-400/50 p-5 sm:p-6 shadow-[0_0_60px_rgba(250,204,21,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-white font-['Plus_Jakarta_Sans']">
        {/* Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-28 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-amber-400/20 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
              <MicOff className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white font-['Outfit'] flex items-center gap-1.5">
                <span>Microphone Access Required</span>
              </h2>
              <p className="text-xs text-amber-200/70">
                Priya se live baat karne ke liye mic allow karein
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-3.5 space-y-3.5 pr-1 relative z-10 text-xs">
          {/* Priya Message Notice */}
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-400/30 flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-amber-400/50">
              <PriyaPortrait size="full" styleMode={avatarLook} />
            </div>
            <p className="text-amber-100 italic leading-relaxed text-[11px] sm:text-xs">
              "Arey meri jaan! Aapka microphone abhi browser ne allow nahi kiya hai. Ek baar Allow button dabayein ya browser settings se unblock karein, fir main aapki har baat sunungi!" 😉💖
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleRetryPermission}
              disabled={isRetrying}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(250,204,21,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Checking Microphone...' : 'Microphone Permission Allow Karein 🎙️'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenTextChat();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bina Mic Ke Likh Kar Baat Karein (Text Mode 💬)</span>
            </button>
          </div>

          {retryStatus === 'failed' && (
            <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>Mic abhi bhi blocked hai. Niche diye steps se address bar mein Allow karein.</span>
            </div>
          )}

          {retryStatus === 'success' && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Microphone successfully connected! Call start ho rahi hai...</span>
            </div>
          )}

          {/* Unblock Instructions Tabs */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Mic Unblock Karne Ka Tarika:</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 text-[10px] sm:text-[11px]">
              <button
                onClick={() => setActiveTab('chrome')}
                className={`py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'chrome'
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Chrome className="w-3 h-3" />
                <span>Android/Chrome</span>
              </button>

              <button
                onClick={() => setActiveTab('ios')}
                className={`py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'ios'
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Apple className="w-3 h-3" />
                <span>iPhone/Safari</span>
              </button>

              <button
                onClick={() => setActiveTab('desktop')}
                className={`py-1.5 px-1 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'desktop'
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Laptop className="w-3 h-3" />
                <span>Computer/PC</span>
              </button>
            </div>

            {/* Tab Guides */}
            <div className="mt-2.5 p-3 rounded-xl bg-slate-900/80 border border-white/10 text-[11px] space-y-2 text-white/90">
              {activeTab === 'chrome' && (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Upar address bar mein website link ke sath bane <strong>🔒 Lock</strong> ya <strong>Tune icon</strong> par tap karein.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span><strong>"Permissions"</strong> ya <strong>"Site settings"</strong> mein jayein.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span><strong>Microphone</strong> ko <strong>"Allow"</strong> par set karein aur page reload karein.</span>
                  </div>
                </>
              )}

              {activeTab === 'ios' && (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Safari ke address bar mein <strong>"aA"</strong> icon par tap karein.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span><strong>"Website Settings"</strong> select karein.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span><strong>Microphone</strong> ko <strong>"Allow"</strong> karein.</span>
                  </div>
                </>
              )}

              {activeTab === 'desktop' && (
                <>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>URL bar ke right side mein <strong>Camera/Mic</strong> icon par click karein.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span><strong>"Always allow Priya to access your microphone"</strong> select karein.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span><strong>Done</strong> dabayein aur "Microphone Permission Allow Karein" par tap karein.</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-amber-400/20 flex items-center justify-between text-xs relative z-10">
          <span className="text-[10px] text-white/40">Priya Audio Engine v3.1</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
