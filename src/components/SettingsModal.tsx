import React, { useState } from 'react';
import {
  X,
  Settings,
  Download,
  Smartphone,
  Flame,
  Volume2,
  Globe2,
  Check,
  Share,
  PlusSquare,
  ShieldCheck,
  Vibrate,
  Sliders,
  ExternalLink,
  PhoneCall,
  Gamepad2,
  Radio,
  Timer,
  VolumeX,
} from 'lucide-react';
import { AppSettings, AmbientMood, AVAILABLE_VOICES, VoiceName } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  currentMood: AmbientMood;
  volume: number;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onChangeVolume: (vol: number) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  volume,
  onUpdateSettings,
  onChangeVolume,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSSteps, setShowIOSSteps] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSSteps(true);
      return;
    }
    const success = await install();
    if (success) {
      setInstallSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit']">Priya Settings</h2>
              <p className="text-xs text-white/50">Personalize voice, persona attitude, and mobile installation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Settings Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-300">
          {/* 1. Mobile App Install Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/30">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Mobile App Install (PWA)</span>
                    {isInstalled ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Installed
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Ready to Install
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Install Priya directly on your Android or iPhone home screen with standalone fullscreen audio!
                  </p>
                </div>
              </div>
            </div>

            {/* Install Button & Status */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              {isInstalled ? (
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Priya is already running as an installed mobile app!</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleInstallClick}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isIOS ? 'Install on iPhone / iPad' : 'Install on Mobile'}</span>
                  </button>

                  <button
                    onClick={() => setShowIOSSteps(!showIOSSteps)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                  >
                    Installation Steps
                  </button>
                </>
              )}
            </div>

            {/* Step-by-Step Instructions Drawer */}
            {showIOSSteps && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mobile Installation Guide:</span>
                </div>

                <div className="space-y-1.5 text-white/80">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      <strong>On Android (Chrome):</strong> Tap the install button above or tap Chrome menu (⋮) &gt; <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      <strong>On iPhone (Safari):</strong> Tap the <strong>Share</strong> button (box with upward arrow) at bottom of Safari &gt; scroll down &gt; tap <strong>"Add to Home Screen"</strong>.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Priya Attitude Level */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Priya Attitude & Vibe
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'spicy',
                  title: 'Spicy / Sassy 🔥',
                  desc: 'Maximum banter, savage one-liners & playful roasts',
                },
                {
                  id: 'playful',
                  title: 'Playful Tease 😉',
                  desc: 'Charming girlfriend teasing & casual fun',
                },
                {
                  id: 'sweet',
                  title: 'Sweet & Caring 🌸',
                  desc: 'Warm, supportive bestie with gentle wit',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdateSettings({ attitudeLevel: opt.id as any })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    settings.attitudeLevel === opt.id
                      ? 'bg-rose-500/20 border-rose-400 shadow-md shadow-rose-950/40 text-white'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-white/70'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{opt.title}</div>
                  <div className="text-[10px] text-white/50 mt-1 leading-snug">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Language Mode */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-cyan-400" /> Language & Dialect
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'hinglish',
                  title: 'Hinglish (Desi)',
                  desc: 'Hindi + English blend (Arey yaar, bolo na)',
                },
                {
                  id: 'english',
                  title: 'English (Chic)',
                  desc: 'Fluent English with sassy girlfriend tone',
                },
                {
                  id: 'hindi',
                  title: 'Hindi (Bollywood)',
                  desc: 'Casual Hindi conversations & shayari',
                },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => onUpdateSettings({ languageMode: lang.id as any })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    settings.languageMode === lang.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-white/70'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{lang.title}</div>
                  <div className="text-[10px] text-white/50 mt-1">{lang.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Voice Model Selection (Boy & Girl Voices + Auto-Speak) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-purple-400" /> Awaaz Model (👦 Ladka / 👧 Ladki)
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                {AVAILABLE_VOICES.length} VOICES
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {AVAILABLE_VOICES.map((v) => {
                const isSelected = settings.voice === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onUpdateSettings({ voice: v.id })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? v.gender === 'male'
                          ? 'bg-blue-500/20 border-blue-400 shadow-md text-white'
                          : 'bg-pink-500/20 border-pink-400 shadow-md text-white'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-white/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span>{v.gender === 'male' ? '👦' : '👧'}</span>
                        <span>{v.displayName}</span>
                        <span className="text-[10px] text-white/40">({v.id})</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                    </div>
                    <div className="text-[10px] text-white/50 mt-1 leading-snug">{v.description}</div>
                  </button>
                );
              })}
            </div>

            {/* Awaaz Bhi Bole (Auto-Speak Reply) */}
            <label className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-colors mt-2">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Awaaz Bhi Bole (Auto-Speak Chat Replies) 🔊</span>
                </div>
                <div className="text-[10px] text-white/50">
                  Jab aap chat mein likhenge, tab Jarvis chuni hui awaaz mein bolkar jawab dega
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSpeakChat}
                onChange={(e) => onUpdateSettings({ autoSpeakChat: e.target.checked })}
                className="w-4 h-4 accent-purple-400 cursor-pointer"
              />
            </label>
          </div>

          {/* 5. Audio Output Volume Slider */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-white flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Master Voice Volume
              </span>
              <span className="font-mono text-cyan-300 font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* 6. Khud Piya Ji Call Lagayein (Auto-Call Settings) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                  <PhoneCall className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Khud Piya Ji Call Lagaye (Auto-Call)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                      AUTO
                    </span>
                  </div>
                  <div className="text-[10px] text-white/60">
                    Priya will proactively call you when idle or waiting
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoCallEnabled}
                onChange={(e) => onUpdateSettings({ autoCallEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
              />
            </div>

            {settings.autoCallEnabled && (
              <div className="pt-2 border-t border-emerald-500/20">
                <div className="text-[11px] text-emerald-300 font-semibold mb-2 flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  <span>Call Interval (Kitni der baad call karein):</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '30 sec', val: 30 },
                    { label: '45 sec', val: 45 },
                    { label: '1 min', val: 60 },
                    { label: '3 min', val: 180 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => onUpdateSettings({ autoCallIntervalSeconds: item.val })}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                        settings.autoCallIntervalSeconds === item.val
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-105'
                          : 'bg-emerald-950/40 text-emerald-200/70 hover:bg-emerald-950/70 border border-emerald-500/20'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7. Awaaz Bahar (Loudspeaker Booster 220%) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Awaaz Bahar (Loud Speaker 220%)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                      BOOST
                    </span>
                  </div>
                  <div className="text-[10px] text-white/60">
                    High-amplitude audio gain so Priya is heard loud & clear over games & background noise
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.loudSpeakerBoost}
                onChange={(e) => onUpdateSettings({ loudSpeakerBoost: e.target.checked })}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* 8. Gaming Companion Floating Mode */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-400/30">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Gaming Companion (Pass Aana Chahiye)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono">
                      PASS
                    </span>
                  </div>
                  <div className="text-[10px] text-white/60">
                    Always-on floating Priya avatar on screen with cheering, reflex game & 1-tap call
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.gamingCompanionEnabled}
                onChange={(e) => onUpdateSettings({ gamingCompanionEnabled: e.target.checked })}
                className="w-4 h-4 accent-purple-400 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* 9. Standard Toggles */}
          <div className="space-y-2.5">
            <label className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-2.5">
                <Vibrate className="w-4 h-4 text-pink-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Haptic Vibration Feedback</div>
                  <div className="text-[10px] text-white/50">Vibrate mobile phone when tapping orb & reactions</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.hapticFeedback}
                onChange={(e) => onUpdateSettings({ hapticFeedback: e.target.checked })}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </label>

            <label className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Auto-Preview External Tools</div>
                  <div className="text-[10px] text-white/50">Display action HUD previews when Priya triggers web links</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoLaunchLinks}
                onChange={(e) => onUpdateSettings({ autoLaunchLinks: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <span className="text-xs text-white/40">Settings saved automatically</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
