import React, { useState } from 'react';
import {
  X,
  Volume2,
  Mic,
  Check,
  Play,
  Square,
  Sparkles,
  User,
  Heart,
  Flame,
  Shield,
  Zap,
} from 'lucide-react';
import { VoiceName, AVAILABLE_VOICES, VoiceOption } from '../types';
import { speakText, stopSpeaking } from '../utils/speechVoice';

interface VoiceSelectorModalProps {
  isOpen: boolean;
  currentVoice: VoiceName;
  autoSpeakChat: boolean;
  onSelectVoice: (voice: VoiceName) => void;
  onToggleAutoSpeakChat: (enabled: boolean) => void;
  onClose: () => void;
}

export const VoiceSelectorModal: React.FC<VoiceSelectorModalProps> = ({
  isOpen,
  currentVoice,
  autoSpeakChat,
  onSelectVoice,
  onToggleAutoSpeakChat,
  onClose,
}) => {
  const [filterGender, setFilterGender] = useState<'all' | 'female' | 'male'>('all');
  const [playingVoiceId, setPlayingVoiceId] = useState<VoiceName | null>(null);

  if (!isOpen) return null;

  const filteredVoices = AVAILABLE_VOICES.filter((v) => {
    if (filterGender === 'all') return true;
    return v.gender === filterGender;
  });

  const handleTestPreview = (voice: VoiceOption, e: React.MouseEvent) => {
    e.stopPropagation();

    if (playingVoiceId === voice.id) {
      stopSpeaking();
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(voice.id);

    const sampleText =
      voice.gender === 'male'
        ? voice.id === 'Charon'
          ? 'Haanji Boss! Main aapka personal AI assistant bol raha hoon. Kahiye aaj kya bada mission plan karna hai?'
          : voice.id === 'Puck'
          ? 'Arey bhai kya scene hai! Main full energy mein ready hoon, batao kya mast plan banayein aaj!'
          : 'Hello brother! Main hamesha aapke sath hoon, games ho ya daily chat, batao kya help karoon?'
        : voice.id === 'Kore'
        ? 'Namaste ji! Main Ananya hoon, aapke har sawaal ka badi shanti aur pyaar se jawab dungi.'
        : 'Arey meri jaan! Priya line par hai. Kahiye, aaj kiska dil jeetna hai aur kya naya gossip hai?';

    speakText(sampleText, voice.id, 1.0, () => {
      setPlayingVoiceId(null);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950/95 border-2 border-amber-400/50 p-5 sm:p-6 shadow-[0_0_60px_rgba(250,204,21,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-white font-['Plus_Jakarta_Sans']">
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-amber-400/20 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shadow-md shadow-amber-500/30 flex items-center justify-center text-slate-950">
              <Volume2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white font-['Outfit']">
                  Awaaz Chunein (Voice Selection)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-bold uppercase">
                  5 VOICES 🎙️
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                Ladke aur Ladki ki shaandar voice options
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-3.5 space-y-3.5 pr-1 relative z-10 text-xs">
          {/* Awaaz Bhi Bole Toggle (Auto-Speak Text Replies) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-transparent border border-amber-400/40 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4 fill-current animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Awaaz Bhi Bole (Auto-Speak Chat)</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono">
                    LIVE TTS
                  </span>
                </div>
                <div className="text-[10px] text-amber-200/70">
                  Likh kar baat karne par bhi Priya/Kabir awaaz bol kar sunayenge
                </div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={autoSpeakChat}
              onChange={(e) => onToggleAutoSpeakChat(e.target.checked)}
              className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
            />
          </div>

          {/* Gender Filter Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
            <button
              onClick={() => setFilterGender('all')}
              className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                filterGender === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span>Sabhi (All)</span>
            </button>

            <button
              onClick={() => setFilterGender('male')}
              className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                filterGender === 'male'
                  ? 'bg-cyan-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-cyan-300 hover:text-white'
              }`}
            >
              <span>👦 Ladka (Male)</span>
            </button>

            <button
              onClick={() => setFilterGender('female')}
              className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                filterGender === 'female'
                  ? 'bg-pink-400 text-slate-950 shadow-md font-extrabold'
                  : 'text-pink-300 hover:text-white'
              }`}
            >
              <span>👧 Ladki (Female)</span>
            </button>
          </div>

          {/* Voice Cards List */}
          <div className="space-y-2.5">
            {filteredVoices.map((voice) => {
              const isSelected = currentVoice === voice.id;
              const isPlaying = playingVoiceId === voice.id;
              const isMale = voice.gender === 'male';

              return (
                <div
                  key={voice.id}
                  onClick={() => onSelectVoice(voice.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? isMale
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
                        : 'bg-amber-500/20 border-amber-400 shadow-[0_0_25px_rgba(250,204,21,0.25)]'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm shadow-md ${
                        isMale
                          ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40'
                          : 'bg-amber-500/25 text-amber-300 border border-amber-400/40'
                      }`}
                    >
                      {isMale ? '👦' : '👧'}
                    </div>

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white font-['Outfit']">
                          {voice.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold uppercase ${
                            isMale
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                              : 'bg-pink-500/20 text-pink-300 border border-pink-400/30'
                          }`}
                        >
                          {isMale ? 'Ladka 👦' : 'Ladki 👧'}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black">
                            SELECTED ✓
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-white/70 italic line-clamp-1">
                        {voice.description}
                      </p>
                      <p className="text-[10px] text-amber-200/60 font-mono">
                        Hindi: {voice.hindiName} • {voice.vibe}
                      </p>
                    </div>
                  </div>

                  {/* Test Preview Audio Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleTestPreview(voice, e)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                        isPlaying
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15'
                      }`}
                      title="Awaaz Suno (Preview)"
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Suno 🔊</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-amber-400/20 flex items-center justify-between text-xs relative z-10">
          <span className="text-[10px] text-white/40 font-mono">
            Selected: <strong className="text-amber-300">{currentVoice}</strong>
          </span>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-yellow-300 text-slate-950 font-bold transition-colors cursor-pointer"
          >
            Done (Lagao)
          </button>
        </div>
      </div>
    </div>
  );
};
