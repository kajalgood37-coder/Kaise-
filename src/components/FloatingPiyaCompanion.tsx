import React, { useState } from 'react';
import {
  PhoneCall,
  Volume2,
  VolumeX,
  Gamepad2,
  X,
  Minimize2,
  Maximize2,
  Heart,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PriyaPortrait } from './PriyaPortrait';
import { AssistantState } from '../types';
import { playReactionSound } from '../utils/soundEffects';

interface FloatingPiyaCompanionProps {
  state: AssistantState;
  micVolume: number;
  loudSpeakerBoost: boolean;
  onOpenGamingModal: () => void;
  onStartCall: () => void;
  onToggleLoudspeaker: () => void;
}

export const FloatingPiyaCompanion: React.FC<FloatingPiyaCompanionProps> = ({
  state,
  micVolume,
  loudSpeakerBoost,
  onOpenGamingModal,
  onStartCall,
  onToggleLoudspeaker,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [cheerIndex, setCheerIndex] = useState<number>(0);

  const cheerMessages = [
    'Jarvis Golden Mode active! Main pass hi hoon Sir, full focus se kheliye! 🎮✨',
    'Tactical assessment: Flawless move, Boss! Jeet pakki hai! 🏆',
    'Telemetry 100%! Priya Jarvis is monitoring your gameplay! ⚡',
    'Jarvis protocol: Power levels maximum! Go crush the level, handsome! 🔥',
    'Thak gaye kya Sir? Kuch relaxation aur Priya se gupshup ho jaye? 💖',
  ];

  const handleNextCheer = () => {
    playReactionSound('sparkle');
    setCheerIndex((prev) => (prev + 1) % cheerMessages.length);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-3 z-40 animate-in fade-in zoom-in duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-[0_0_25px_rgba(255,215,0,0.6)] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer border-2 border-white"
          title="Priya Jarvis Gaming Buddy (Tap to Open)"
        >
          <div className="w-full h-full rounded-full overflow-hidden">
            <PriyaPortrait size="full" isSpeaking={state === 'speaking'} />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-900 animate-ping" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-3 z-40 max-w-[280px] sm:max-w-xs animate-in slide-in-from-right-4 duration-300 select-none">
      <div className="relative p-3 rounded-3xl bg-slate-950/95 border-2 border-amber-400/50 shadow-[0_0_35px_rgba(255,215,0,0.35)] backdrop-blur-xl flex flex-col gap-2">
        {/* Top bar of widget */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300 font-['Outfit']">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Priya Jarvis (Pass Hoon) ⚡</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content: Portrait + Dialogue Bubble */}
        <div className="flex items-center gap-2.5">
          <div
            onClick={handleNextCheer}
            className="w-14 h-14 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-pink-500 to-cyan-400 shrink-0 shadow-md cursor-pointer hover:scale-105 transition-transform"
            title="Tap for Next Cheer"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-950">
              <PriyaPortrait
                size="full"
                isSpeaking={state === 'speaking'}
                isListening={state === 'listening'}
                audioLevel={micVolume}
              />
            </div>
          </div>

          <div
            onClick={handleNextCheer}
            className="flex-1 bg-white/[0.04] p-2 rounded-2xl border border-white/10 text-[11px] text-white/90 italic cursor-pointer hover:bg-white/[0.08] transition-colors leading-snug"
          >
            "{cheerMessages[cheerIndex]}"
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10">
          {/* Loud Speaker toggle */}
          <button
            onClick={onToggleLoudspeaker}
            className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all border ${
              loudSpeakerBoost
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-sm'
                : 'bg-white/5 text-white/60 border-white/10'
            }`}
            title="Loud Speaker Awaaz Bahar"
          >
            <Volume2 className="w-3 h-3 text-emerald-400" />
            <span>{loudSpeakerBoost ? 'Loud 📢' : 'Normal'}</span>
          </button>

          {/* Arcade Modal */}
          <button
            onClick={onOpenGamingModal}
            className="px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1 transition-all"
            title="Open Games with Priya"
          >
            <Gamepad2 className="w-3 h-3" />
            <span>Games</span>
          </button>

          {/* Call Priya Button */}
          <button
            onClick={onStartCall}
            className="px-2.5 py-1 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-300 text-[10px] font-bold flex items-center gap-1 transition-all"
            title="Call Piya"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
