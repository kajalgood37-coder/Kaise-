import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Battery, Wifi, Radio, Volume2, Mic, Sparkles } from 'lucide-react';
import { PriyaPortrait } from './PriyaPortrait';
import { AssistantState, AvatarLookStyle } from '../types';

interface ScreenLockModalProps {
  isOpen: boolean;
  state: AssistantState;
  avatarLook?: AvatarLookStyle;
  onUnlock: () => void;
}

export const ScreenLockModal: React.FC<ScreenLockModalProps> = ({
  isOpen,
  state,
  avatarLook = 'royal-gold',
  onUnlock,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [batteryLevel, setBatteryLevel] = useState<number>(85);
  const [isHoldingUnlock, setIsHoldingUnlock] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      onDoubleClick={onUnlock}
      className="fixed inset-0 z-[100] bg-black text-white flex flex-col justify-between p-6 sm:p-10 select-none cursor-default font-['Plus_Jakarta_Sans'] animate-in fade-in duration-300"
    >
      {/* Top Status Bar in Lock Screen */}
      <div className="flex items-center justify-between text-xs text-white/50 tracking-wider">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-mono text-[11px] text-amber-200/80">JARVIS SECURE LOCK • 5G VoLTE</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-white/70" />
            <span>Wi-Fi 6</span>
          </span>
          <span className="flex items-center gap-1">
            <Battery className="w-3.5 h-3.5 text-amber-400" />
            <span>{batteryLevel}%</span>
          </span>
        </div>
      </div>

      {/* Center Always-On Display (AOD) Time & Priya Heartbeat Orb */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        {/* Subtle lock icon */}
        <div className="mb-4 p-3 rounded-full bg-white/5 border border-white/10 text-amber-300/80">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>

        {/* Digital Clock */}
        <h1 className="text-6xl sm:text-7xl font-extralight tracking-tight text-white font-['Outfit'] drop-shadow-[0_0_20px_rgba(255,215,0,0.2)]">
          {timeStr || '12:00:00'}
        </h1>
        <p className="text-sm sm:text-base text-amber-200/70 font-medium mt-2 tracking-wide">
          {dateStr}
        </p>

        {/* Priya Active Background Heartbeat Indicator */}
        <div className="mt-8 flex flex-col items-center gap-3 p-4 rounded-3xl bg-slate-950/80 border border-amber-400/30 shadow-[0_0_40px_rgba(255,215,0,0.15)] max-w-xs w-full backdrop-blur-md">
          <div className="relative">
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-md overflow-hidden">
              <PriyaPortrait size="full" styleMode={avatarLook} isSpeaking={state === 'speaking'} />
            </div>
            {state === 'speaking' && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 animate-ping border border-black" />
            )}
          </div>

          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
              <span>Priya Jarvis Active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-amber-300/80 font-mono">
              {state === 'speaking'
                ? 'Speaking in Background 🔊'
                : state === 'listening'
                ? 'Listening to your voice 🎙️'
                : 'Background Standby • Battery Saving Mode'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Unlock Trigger Button & Hints */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onUnlock}
          className="group relative px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-2.5 transition-all shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <Unlock className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
          <span>Screen Unlock Karein (Tap to Unlock)</span>
        </button>

        <p className="text-[10px] text-white/40 tracking-wider">
          Screen par double-tap karke bhi unlock kar sakte hain
        </p>
      </div>
    </div>
  );
};
