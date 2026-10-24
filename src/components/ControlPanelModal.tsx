import React from 'react';
import {
  X,
  Sliders,
  Moon,
  Sun,
  Lock,
  Volume2,
  VolumeX,
  Mic,
  Radio,
  PhoneCall,
  Gamepad2,
  Sparkles,
  Zap,
  Check,
  Crown,
  Heart,
  Flame,
  Vibrate,
  Shield,
  Eye,
  Camera,
  Video,
  Download,
  Smartphone,
} from 'lucide-react';
import { AppSettings, AmbientMood, AvatarLookStyle, VoiceName, AVAILABLE_VOICES } from '../types';
import { PriyaPortrait } from './PriyaPortrait';

interface ControlPanelModalProps {
  isOpen: boolean;
  settings: AppSettings;
  volume: number;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onChangeVolume: (vol: number) => void;
  onClose: () => void;
  onLockScreen: () => void;
  onOpenVideoStudio: () => void;
  onOpenChat: () => void;
  onOpenInstallModal?: () => void;
  onOpenVoiceModal?: () => void;
}

export const ControlPanelModal: React.FC<ControlPanelModalProps> = ({
  isOpen,
  settings,
  volume,
  onUpdateSettings,
  onChangeVolume,
  onClose,
  onLockScreen,
  onOpenVideoStudio,
  onOpenChat,
  onOpenInstallModal,
  onOpenVoiceModal,
}) => {
  if (!isOpen) return null;

  const avatarLooks: { id: AvatarLookStyle; name: string; desc: string; icon: string }[] = [
    {
      id: 'royal-gold',
      name: 'Royal Gold Queen',
      desc: 'Imperial 24K gold jewelry, pearl drops, gold embroidery & bindi',
      icon: '👑',
    },
    {
      id: 'desi-glam',
      name: 'Desi Glamour Princess',
      desc: 'Velvet saree, traditional jhumkas, rose gloss & sweet smile',
      icon: '🌸',
    },
    {
      id: 'cyber-jarvis',
      name: 'Cyber Jarvis Edition',
      desc: 'Futuristic golden visor headset & high-tech cyber collar',
      icon: '⚡',
    },
    {
      id: 'bollywood-chic',
      name: 'Bollywood Red Carpet',
      desc: 'Obsidian silk, sparkling diamond choker & starry glam look',
      icon: '✨',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-950 border border-amber-400/40 shadow-[0_0_50px_rgba(255,215,0,0.2)] overflow-hidden flex flex-col max-h-[92vh] font-['Plus_Jakarta_Sans']">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg text-slate-950 font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                <span>Jarvis Controller Panel</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono">
                  PRO MAX
                </span>
              </h2>
              <p className="text-xs text-amber-200/60">Master system controls, avatar looks & power modes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-300">
          {/* Quick Action Matrix (Offline Mode & Screen Lock) */}
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Offline Mode ("Jaanway offline ho jaaun") */}
            <button
              onClick={() => onUpdateSettings({ isOffline: !settings.isOffline })}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                settings.isOffline
                  ? 'bg-indigo-950/40 border-indigo-400/60 shadow-[0_0_25px_rgba(99,102,241,0.25)]'
                  : 'bg-emerald-950/30 border-emerald-500/40 hover:bg-emerald-950/50'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  settings.isOffline
                    ? 'bg-indigo-500/30 text-indigo-300'
                    : 'bg-emerald-500/30 text-emerald-300'
                }`}
              >
                {settings.isOffline ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{settings.isOffline ? 'Offline Mode (Active)' : 'Online Mode'}</span>
                </div>
                <div className="text-[10px] text-white/60 mt-0.5">
                  {settings.isOffline
                    ? 'Priya is resting • Auto-calls paused'
                    : 'Tap to go Offline / DND mode'}
                </div>
              </div>
            </button>

            {/* 2. Screen Lock ("band bhi kar sake screen") */}
            <button
              onClick={() => {
                onClose();
                onLockScreen();
              }}
              className="p-3.5 rounded-2xl bg-amber-950/20 hover:bg-amber-950/40 border border-amber-400/40 text-left flex items-start gap-3 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-200">Screen Lock (Band Karein)</div>
                <div className="text-[10px] text-white/60 mt-0.5">
                  AMOLED black lock screen • Background listening
                </div>
              </div>
            </button>
          </div>

          {/* Mobile Install & Download Banner Card */}
          {onOpenInstallModal && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-2 border-emerald-400/40 flex items-center justify-between gap-3 shadow-lg shadow-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  <Download className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <span>Mobile Mein Install & Download Karein</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-black uppercase">
                      PWA
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-200/80">
                    Phone home screen par icon lagayein ya launcher download karein
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenInstallModal();
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold text-xs shrink-0 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Install 📲
              </button>
            </div>
          )}

          {/* Avatar Look Picker ("aur ismein badhiya Si ladki ko add kar do") */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-400/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-['Outfit']">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Priya Avatar Looks (Choose Your Favorite Girl)</span>
              </span>
              <span className="text-[10px] text-amber-300 font-mono font-semibold">4 STYLES</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {avatarLooks.map((look) => {
                const isSelected = settings.avatarLook === look.id;
                return (
                  <button
                    key={look.id}
                    onClick={() => onUpdateSettings({ avatarLook: look.id })}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/20'
                        : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.06] text-white/70'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-amber-400/40 shadow-inner">
                      <PriyaPortrait size="full" styleMode={look.id} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{look.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="text-[10px] text-white/50 truncate mt-0.5">{look.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Gender Selection (👦 Ladka / 👧 Ladki Awaaz + Awaaz Bhi Bole) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-amber-400/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white font-['Outfit']">
                  Awaaz Ka Chunav (Boy & Girl Voices)
                </span>
              </div>
              {onOpenVoiceModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenVoiceModal();
                  }}
                  className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
                >
                  Sabhi Awaaz Dekhein &gt;
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_VOICES.map((v) => {
                const isSelected = settings.voice === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => onUpdateSettings({ voice: v.id })}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? v.gender === 'male'
                          ? 'bg-blue-500/25 border-blue-400 text-white shadow-md'
                          : 'bg-pink-500/25 border-pink-400 text-white shadow-md'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] text-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{v.gender === 'male' ? '👦' : '👧'}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                          <span>{v.displayName}</span>
                        </div>
                        <div className="text-[10px] text-white/50 truncate">{v.tone}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Awaaz Bhi Bole Toggle */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Awaaz Bhi Bole (Auto-Speak Text)</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    BOLIYE 🔊
                  </span>
                </div>
                <div className="text-[10px] text-white/50">
                  Text chat bhejne par Priya ya Kabir turant bolkar jawab dega
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSpeakChat}
                onChange={(e) => onUpdateSettings({ autoSpeakChat: e.target.checked })}
                className="w-4 h-4 accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Master Voice Volume Slider */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-400" /> Master Voice Volume
              </span>
              <span className="font-mono text-amber-300 font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Quick Features & Toggles */}
          <div className="space-y-2.5">
            {/* 1. Loudspeaker Boost (220% Awaaz Bahar) */}
            <label className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>Awaaz Bahar (Loudspeaker 220% Boost)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                      BOOST
                    </span>
                  </div>
                  <div className="text-[10px] text-white/50">Extra amplified audio for speakers & background noise</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.loudSpeakerBoost}
                onChange={(e) => onUpdateSettings({ loudSpeakerBoost: e.target.checked })}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </label>

            {/* 2. Auto-Call from Priya ("Khud Piya ji call lagaye") */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Khud Piya Ji Call Karein (Auto-Call)</div>
                    <div className="text-[10px] text-white/50">Priya calls you when idle</div>
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
                <div className="pt-2 border-t border-white/5 flex items-center gap-1.5">
                  {[30, 45, 60, 180].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => onUpdateSettings({ autoCallIntervalSeconds: sec })}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        settings.autoCallIntervalSeconds === sec
                          ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Gaming Companion Floating Mode */}
            <label className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-400/30">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Gaming Companion (Pass Aana Chahiye)</div>
                  <div className="text-[10px] text-white/50">Floating on-screen avatar with cheering & arcade</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.gamingCompanionEnabled}
                onChange={(e) => onUpdateSettings({ gamingCompanionEnabled: e.target.checked })}
                className="w-4 h-4 accent-purple-400 rounded cursor-pointer"
              />
            </label>

            {/* 4. Haptic Feedback */}
            <label className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-400/30">
                  <Vibrate className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Haptic Vibration Touch</div>
                  <div className="text-[10px] text-white/50">Vibrate mobile when tapping orb & actions</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.hapticFeedback}
                onChange={(e) => onUpdateSettings({ hapticFeedback: e.target.checked })}
                className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
          <span className="text-xs text-white/40 font-mono">Jarvis Command Core v2.4</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
