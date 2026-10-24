import React from 'react';
import { X, Sparkles, Heart, Zap, Globe, MessageSquare, Flame, Camera, Phone } from 'lucide-react';

interface PersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PersonalityModal: React.FC<PersonalityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sampleBanter = [
    {
      category: 'Jarvis Super-Intelligence & Tactical ⚡👑',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      prompts: [
        '"Jarvis, status report do aur mera schedule plan karo!"',
        '"Priya Jarvis, situation analyze karke tactical decision batao."',
        '"Tony Stark ko bhool jao, batao hum dono aaj kya dhamaka karenge?"',
        '"Jarvis mode mein Golden White aura activate karo!"',
        '"Mujhe ek complex problem explain karo simple shabdon mein."',
      ],
    },
    {
      category: 'Photo & Call Features 📸 📞',
      icon: <Camera className="w-4 h-4 text-pink-400" />,
      prompts: [
        '"Priya, meri ek photo khincho!"',
        '"Dekh kar batao, main is photo mein kaisa lag raha hoon?"',
        '"Selfie time! Photo booth open karo."',
        '"Priya, mujhe direct call lagao."',
      ],
    },
    {
      category: 'Hinglish & Desi Banter',
      icon: <Sparkles className="w-4 h-4 text-amber-300" />,
      prompts: [
        '"Chalti firti aafat ho tum ya main?"',
        '"Arey Priya, itna attitude kahan se laati ho?"',
        '"Sach batao, miss kar rahi thi na mujhe?"',
        '"Chalo YouTube pe koi mast gana lagao yaar!"',
      ],
    },
    {
      category: 'Flirty & Witty Banter (English)',
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      prompts: [
        '"Priya, be honest—did you miss me?"',
        '"Give me a cute nickname and don\'t make it embarrassing."',
        '"Rate my conversational charm on a scale of 1 to 10."',
        '"Why do you have so much attitude today?"',
      ],
    },
    {
      category: 'Roast & Reality Check',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      prompts: [
        '"Roast my daily routine, but don\'t hurt my feelings too bad!"',
        '"I just ordered takeout again... judge me."',
        '"Should I text my ex? Tell me what you think."',
        '"Do you think I\'m high maintenance?"',
      ],
    },
    {
      category: 'Actions & Voice Tools',
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
      prompts: [
        '"Can you open YouTube for me?"',
        '"Search Google for the best late-night cafes nearby."',
        '"Change the mood to Royal Golden White!"',
        '"Trigger some confetti for me, I need a celebration."',
        '"What time is it right now?"',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-400/30 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 flex items-center justify-center shadow-lg text-slate-950 font-bold">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                <span>Meet Priya</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold uppercase tracking-wider">
                  JARVIS EDITION
                </span>
              </h2>
              <p className="text-xs text-amber-200/80 font-medium">Tony Stark-level intellect with Indian charm & warmth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Persona Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-amber-600/15 border border-amber-400/30">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Jarvis Persona DNA • English & Hinglish
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              Priya speaks with the unmatched brilliance, sharp logic, and lightning-fast solutions of J.A.R.V.I.S., blended with witty banter, warmth, and charismatic teasing. No corporate robot speech—only 100% articulate, natural voice intelligence.
            </p>
          </div>

          {/* Icebreaker Prompts */}
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-white/50 mb-3 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Fun Things to Say Over Voice
            </h3>
            <div className="space-y-4">
              {sampleBanter.map((group, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-2 mb-2 font-medium text-xs text-white">
                    {group.icon}
                    <span>{group.category}</span>
                  </div>
                  <div className="space-y-1.5">
                    {group.prompts.map((prompt, pIdx) => (
                      <div
                        key={pIdx}
                        className="text-xs text-slate-300/90 pl-3 border-l-2 border-pink-500/30 py-0.5"
                      >
                        {prompt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
            <strong className="text-white">Pro Tip:</strong> Priya communicates through real-time audio. Just talk to her normally as if you're on a phone call. If she talks too much, you can talk right over her or tap the central orb to interrupt!
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-medium text-xs transition-all shadow-lg shadow-pink-500/20"
          >
            Got it, Let's Chat!
          </button>
        </div>
      </div>
    </div>
  );
};
