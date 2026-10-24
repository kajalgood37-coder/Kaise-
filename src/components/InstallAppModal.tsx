import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Apple,
  Chrome,
  Check,
  Share2,
  PlusSquare,
  QrCode,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { PriyaPortrait } from './PriyaPortrait';
import { AvatarLookStyle } from '../types';

interface InstallAppModalProps {
  isOpen: boolean;
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  avatarLook?: AvatarLookStyle;
  onClose: () => void;
  onInstall: () => Promise<boolean>;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  isInstalled,
  isInstallable,
  isIOS,
  avatarLook = 'royal-gold',
  onClose,
  onInstall,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'download' | 'qr'>(
    isIOS ? 'ios' : 'android'
  );
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleDirectInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await onInstall();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('[Install] Error triggering prompt:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleDownloadLauncher = () => {
    const launcherHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Priya AI Assistant Launcher</title>
  <meta http-equiv="refresh" content="0; url=${currentUrl}">
  <script>window.location.href = "${currentUrl}";</script>
</head>
<body style="background:#070913;color:#fbbf24;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;">
    <h2>👑 Priya Jarvis AI App Opening...</h2>
    <p>Redirecting to <a href="${currentUrl}" style="color:#67e8f9;">${currentUrl}</a></p>
  </div>
</body>
</html>`;

    const blob = new Blob([launcherHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Priya-Jarvis-AI.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Simple clean QR Code generator via public SVG api
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    currentUrl
  )}&color=fbbf24&bgcolor=070913`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950/95 border-2 border-amber-400/40 p-5 sm:p-7 shadow-[0_0_60px_rgba(250,204,21,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-white font-['Plus_Jakarta_Sans']">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-400/20 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 p-0.5 shadow-md shadow-amber-500/30 overflow-hidden flex items-center justify-center">
              <PriyaPortrait size="full" styleMode={avatarLook} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white font-['Outfit']">
                  Priya AI Mobile Install
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-bold uppercase">
                  PWA 📲
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                Apne phone mein app ki tarah download aur install karein
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 relative z-10">
          {/* Status Box */}
          {isInstalled ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center gap-3 text-emerald-300 text-xs font-semibold">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/30 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
              </div>
              <div>
                <p className="font-bold text-white">App pehle se installed hai! 🎉</p>
                <p className="text-[11px] text-emerald-200/80 font-normal">
                  Priya aapke home screen par full-screen app ki tarah maujood hai.
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/50 flex flex-col gap-2.5 shadow-lg shadow-amber-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Zap className="w-4 h-4 fill-current animate-bounce text-amber-400" />
                  <span>1-Tap Direct Install Ready!</span>
                </div>
                <span className="text-[10px] text-amber-200/70 font-mono">Fast Install</span>
              </div>
              <button
                onClick={handleDirectInstall}
                disabled={isInstalling}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(250,204,21,0.5)] active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{isInstalling ? 'Installing...' : 'Abhi Mobile Mein Install Karein 📲'}</span>
              </button>
            </div>
          ) : null}

          {/* Device Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('android')}
              className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                activeTab === 'android'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Chrome className="w-3.5 h-3.5" />
              <span className="text-[11px]">Android</span>
            </button>

            <button
              onClick={() => setActiveTab('ios')}
              className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                activeTab === 'ios'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span className="text-[11px]">iPhone</span>
            </button>

            <button
              onClick={() => setActiveTab('download')}
              className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                activeTab === 'download'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[11px]">Download</span>
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`py-2 px-1 rounded-xl font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                activeTab === 'qr'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="text-[11px]">QR Scan</span>
            </button>
          </div>

          {/* TAB 1: Android Instructions */}
          {activeTab === 'android' && (
            <div className="space-y-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/25">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Chrome className="w-4 h-4 text-amber-400" />
                <span>Android Chrome Mein Install Karne Ka Tarika:</span>
              </h3>

              <div className="space-y-2.5 text-xs text-white/90">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-white">Browser Menu Kholein</p>
                    <p className="text-[11px] text-amber-200/70">
                      Chrome browser ke top right corner mein <strong>3 dots (⋮)</strong> par tap karein.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-white">"Install app" ya "Add to Home screen" Chunein</p>
                    <p className="text-[11px] text-amber-200/70">
                      Menu list mein se <strong>"Install app"</strong> ya <strong>"होम स्क्रीन में जोड़ें"</strong> par tap karein.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-white">Confirm Karein</p>
                    <p className="text-[11px] text-amber-200/70">
                      <strong>"Install"</strong> button dabayein. Priya ka golden icon aapke phone ke app drawer aur home screen par aa jayega!
                    </p>
                  </div>
                </div>
              </div>

              {isInstallable && (
                <button
                  onClick={handleDirectInstall}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Direct Install Prompt Kholein</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 2: iOS Instructions */}
          {activeTab === 'ios' && (
            <div className="space-y-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/25">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Apple className="w-4 h-4 text-amber-400" />
                <span>iPhone / iPad (Safari) Mein Install Karne Ka Tarika:</span>
              </h3>

              <div className="space-y-2.5 text-xs text-white/90">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-white">Safari Share Button Dabayein</p>
                    <p className="text-[11px] text-amber-200/70 flex items-center gap-1">
                      Safari ke niche toolbar mein <strong>Share icon</strong> (
                      <Share2 className="w-3 h-3 inline text-amber-300" /> square with arrow) tap karein.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-white">"Add to Home Screen" Select Karein</p>
                    <p className="text-[11px] text-amber-200/70 flex items-center gap-1">
                      Options ko scroll karein aur <strong>"Add to Home Screen"</strong> (
                      <PlusSquare className="w-3 h-3 inline text-amber-300" />) par tap karein.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-white">"Add" Dabayein</p>
                    <p className="text-[11px] text-amber-200/70">
                      Top-right corner mein <strong>"Add"</strong> dabayein. Priya aapke iPhone home screen par install ho jayegi!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Download Launcher */}
          {activeTab === 'download' && (
            <div className="space-y-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/25">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Download className="w-4 h-4 text-amber-400" />
                <span>Priya Offline Web Launcher Download:</span>
              </h3>

              <p className="text-xs text-white/80 leading-relaxed">
                Agar aap direct file download karke phone ya computer mein rakhna chahte hain, toh yahan se Priya ka offline launcher file download kar sakte hain.
              </p>

              <button
                onClick={handleDownloadLauncher}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Priya-Jarvis-AI.html Launcher Download Karein (Free)</span>
              </button>

              <div className="pt-2 border-t border-amber-400/20 flex items-center justify-between gap-2">
                <span className="text-[11px] text-amber-200/70 truncate flex-1">
                  {currentUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: QR Code Scan */}
          {activeTab === 'qr' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/25 flex flex-col items-center text-center space-y-3">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>Mobile Camera Se QR Scan Karein:</span>
              </h3>

              <div className="p-3 bg-slate-950 rounded-2xl border-2 border-amber-400/40 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                <img
                  src={qrCodeUrl}
                  alt="Priya AI QR Code"
                  className="w-44 h-44 rounded-xl object-contain"
                />
              </div>

              <p className="text-[11px] text-amber-200/80 max-w-xs">
                Apne phone ka camera is QR code par point karein — link direct mobile mein khul jayegi aur wahan se 1-tap install kar sakte hain!
              </p>
            </div>
          )}

          {/* Key Advantages */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <h4 className="text-[11px] font-bold text-white/90 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Mobile App Install Karne Ke Fayde:</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-white/70">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Fullscreen native experience</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Screen lock & Always-on-display</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>220% loud gaming audio boost</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Zero battery lag & offline mode</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-amber-400/20 flex items-center justify-between text-xs relative z-10">
          <span className="text-[11px] text-white/40 font-mono">PWA v3.1 Ultra Pro Max</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-yellow-300 text-slate-950 font-bold transition-colors cursor-pointer"
          >
            Samajh Gaya (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
