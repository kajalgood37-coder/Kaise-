import React from 'react';
import { X, Check, Palette } from 'lucide-react';
import { AmbientMood, MOOD_PRESETS, MoodConfig } from '../types';

interface MoodSelectorModalProps {
  isOpen: boolean;
  currentMood: AmbientMood;
  onSelectMood: (mood: AmbientMood) => void;
  onClose: () => void;
}

export const MoodSelectorModal: React.FC<MoodSelectorModalProps> = ({
  isOpen,
  currentMood,
  onSelectMood,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">Ambient Lighting Mood</h2>
              <p className="text-xs text-white/50">Change Priya's visual atmosphere</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mood List */}
        <div className="p-6 space-y-3">
          {(Object.values(MOOD_PRESETS) as MoodConfig[]).map((m) => {
            const isSelected = m.id === currentMood;
            return (
              <button
                key={m.id}
                onClick={() => {
                  onSelectMood(m.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                  isSelected
                    ? 'bg-white/10 shadow-lg'
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                }`}
                style={
                  isSelected
                    ? {
                        borderColor: m.accentColor,
                        boxShadow: `0 0 25px ${m.primaryGlow}`,
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-white/20 transition-transform group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${m.accentColor} 0%, ${m.haloColor} 100%)`,
                    }}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white">{m.name}</h3>
                    <p className="text-xs text-white/50">{m.tagline}</p>
                  </div>
                </div>

                {isSelected && (
                  <div
                    className="w-6 h-6 rounded-full text-slate-950 flex items-center justify-center font-bold"
                    style={{ background: m.accentColor }}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
