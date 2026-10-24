import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ExternalLink, Search, Palette, Sparkles, Clock, X } from 'lucide-react';
import { ToolActionItem, AmbientMood } from '../types';

interface ActionHUDProps {
  action: ToolActionItem | null;
  onDismiss: () => void;
  onApplyMood?: (mood: AmbientMood) => void;
  onOpenPhotoModal?: () => void;
}

export const ActionHUD: React.FC<ActionHUDProps> = ({
  action,
  onDismiss,
  onApplyMood,
  onOpenPhotoModal,
}) => {
  useEffect(() => {
    if (!action) return;

    // Trigger visual confetti / hearts if reactionType was called
    if (action.name === 'triggerReaction') {
      const reactionType = action.args?.reactionType;
      if (reactionType === 'hearts' || reactionType === 'tease') {
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ff2a85', '#ff758c', '#ff007f', '#ffffff'],
          shapes: ['circle'],
        });
      } else {
        confetti({
          particleCount: 70,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#00f0ff', '#ff007f', '#ffd700', '#9d4edd'],
        });
      }
    }

    // Auto open camera if Priya invoked takePhoto
    if (action.name === 'takePhoto' && onOpenPhotoModal) {
      onOpenPhotoModal();
    }

    // Auto apply mood if requested by Priya
    if (action.name === 'setAmbientMood' && action.args?.mood && onApplyMood) {
      onApplyMood(action.args.mood as AmbientMood);
    }

    // Auto dismiss after 9 seconds unless user clicks
    const timer = setTimeout(() => {
      onDismiss();
    }, 9000);

    return () => clearTimeout(timer);
  }, [action, onDismiss, onApplyMood, onOpenPhotoModal]);

  if (!action) return null;

  return (
    <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="relative p-4 rounded-2xl bg-slate-900/90 border border-cyan-400/30 backdrop-blur-xl shadow-2xl shadow-cyan-950/50 flex items-start gap-3 text-white">
        {/* Glow accent */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-rose-500/20 to-purple-500/20 -z-10 blur-sm" />

        {/* Action Icon */}
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 text-cyan-300">
          {action.name === 'openWebsite' && <ExternalLink className="w-5 h-5" />}
          {action.name === 'searchGoogle' && <Search className="w-5 h-5" />}
          {action.name === 'playSong' && <span className="text-rose-400 font-bold text-sm">🎶</span>}
          {action.name === 'takePhoto' && <span className="text-pink-400 font-bold text-sm">📸</span>}
          {action.name === 'makePhoneCall' && <span className="text-emerald-400 font-bold text-sm">📞</span>}
          {action.name === 'setAmbientMood' && <Palette className="w-5 h-5" />}
          {action.name === 'triggerReaction' && <Sparkles className="w-5 h-5 text-rose-300" />}
          {action.name === 'getDeviceTime' && <Clock className="w-5 h-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
              Action Executed
            </span>
            <span className="text-xs text-white/50">Just now</span>
          </div>

          {action.name === 'playSong' && (
            <div className="mt-1.5">
              <p className="text-sm font-semibold text-white truncate">
                🎵 Priya queued: <span className="text-rose-300">{action.args.title}</span>
              </p>
              <p className="text-xs text-white/50 truncate">
                {action.args.artist || 'Featured Track'} • {action.args.genre || 'Desi Hits'}
              </p>
              <a
                href={
                  action.result?.searchUrl ||
                  `https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${action.args.title} ${action.args.artist || ''} song`
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-white transition-colors shadow-md"
              >
                <span>Listen on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {action.name === 'takePhoto' && (
            <div className="mt-1.5">
              <p className="text-sm font-semibold text-white">
                📸 Priya says: <span className="text-pink-300">"{action.args.comment || 'Smile karo handsome!'}"</span>
              </p>
              {onOpenPhotoModal && (
                <button
                  onClick={onOpenPhotoModal}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-pink-500 hover:bg-pink-400 text-white transition-colors shadow-md"
                >
                  <span>Open Camera / Photo Booth</span>
                </button>
              )}
            </div>
          )}

          {action.name === 'makePhoneCall' && (
            <div className="mt-1.5">
              <p className="text-sm font-semibold text-white">
                📞 Calling: <span className="text-emerald-300 font-bold">{action.args.contactName}</span>
                {action.args.phoneNumber && ` (${action.args.phoneNumber})`}
              </p>
              <p className="text-xs text-white/60 mt-0.5">
                {action.result?.comment || 'Opening phone dialer...'}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <a
                  href={action.result?.telUrl || (action.args.phoneNumber ? `tel:${action.args.phoneNumber}` : 'tel:')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Call on Phone</span>
                </a>

                {action.result?.whatsappUrl && (
                  <a
                    href={action.result.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/40 transition-colors"
                  >
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {action.name === 'openWebsite' && (
            <div className="mt-1.5">
              <p className="text-sm font-medium text-white truncate">
                Priya triggered link: <span className="text-cyan-300">{action.args.name || action.args.url}</span>
              </p>
              <a
                href={action.args.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-md"
              >
                <span>Open in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {action.name === 'searchGoogle' && (
            <div className="mt-1.5">
              <p className="text-sm font-medium text-white truncate">
                Searching: <span className="text-cyan-300">"{action.args.query}"</span>
              </p>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(action.args.query || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
              >
                <span>View Google Results</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {action.name === 'setAmbientMood' && (
            <div className="mt-1.5">
              <p className="text-sm font-medium text-white">
                Lighting vibe tuned to <span className="text-purple-300 font-semibold">{action.args.mood}</span>
              </p>
            </div>
          )}

          {action.name === 'triggerReaction' && (
            <div className="mt-1.5">
              <p className="text-sm font-medium text-rose-300">
                {action.args.message || 'Priya sent you a flirty sparkle! ✨'}
              </p>
            </div>
          )}

          {action.name === 'getDeviceTime' && (
            <div className="mt-1.5">
              <p className="text-sm font-medium text-white">
                Clock synced: <span className="text-cyan-300">{action.result?.currentTime}</span> ({action.result?.dayOfWeek})
              </p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
