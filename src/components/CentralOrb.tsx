import { AssistantState, MoodConfig, AvatarLookStyle } from '../types';
import { PriyaPortrait } from './PriyaPortrait';
import { Moon, Power, Loader2, Mic, MicOff, Volume2, Video } from 'lucide-react';

interface CentralOrbProps {
  state: AssistantState;
  mood: MoodConfig;
  isMuted: boolean;
  micVolume?: number;
  avatarLook?: AvatarLookStyle;
  isOffline?: boolean;
  onToggleCall: () => void;
  onInterrupt: () => void;
  onToggleMute: () => void;
  onOpenVideoCall?: () => void;
}

export const CentralOrb: React.FC<CentralOrbProps> = ({
  state,
  mood,
  isMuted,
  micVolume = 0,
  avatarLook = 'royal-gold',
  isOffline = false,
  onToggleCall,
  onInterrupt,
  onToggleMute,
  onOpenVideoCall,
}) => {
  const isConnected = state === 'listening' || state === 'speaking';
  const isConnecting = state === 'connecting';
  const isIdle = state === 'idle';

  const handleClick = () => {
    // Light haptic feedback if supported on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }

    if (state === 'speaking') {
      // Tap during speaking interrupts Priya
      onInterrupt();
    } else if (state === 'idle') {
      onToggleCall();
    } else if (isConnected) {
      // Tap when listening toggles mute or disconnects via press
      onToggleCall();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-auto z-10 select-none">
      {/* Outer ambient glow pulse */}
      <div
        className={`absolute -inset-10 rounded-full blur-3xl opacity-60 transition-all duration-700 pointer-events-none ${
          state === 'speaking'
            ? 'scale-125 opacity-90'
            : state === 'listening'
            ? 'scale-110 opacity-75 animate-pulse'
            : state === 'connecting'
            ? 'scale-105 opacity-60'
            : 'scale-90 opacity-40'
        }`}
        style={{
          background: `radial-gradient(circle, ${mood.primaryGlow} 0%, ${mood.secondaryGlow} 50%, transparent 75%)`,
        }}
      />

      {/* Futuristic concentric rotating ring */}
      {(isConnected || isConnecting) && (
        <div
          className={`absolute -inset-6 rounded-full border border-dashed transition-all duration-1000 pointer-events-none ${
            isConnecting ? 'animate-spin' : 'opacity-40 animate-[spin_20s_linear_infinite]'
          }`}
          style={{
            borderColor: mood.accentColor,
            borderWidth: '1.5px',
          }}
        />
      )}

      {/* Main Orb Button with PIYA JI'S PORTRAIT PHOTO IN FRONT */}
      <button
        onClick={handleClick}
        disabled={isConnecting}
        aria-label={
          isIdle
            ? 'Call Priya'
            : state === 'speaking'
            ? 'Interrupt Priya'
            : 'Disconnect Call'
        }
        className={`relative group w-44 h-44 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer active:scale-95 focus:outline-none backdrop-blur-xl shadow-2xl p-1.5 ${
          isIdle
            ? mood.id === 'golden-white'
              ? 'border-2 border-amber-300/60 hover:border-amber-200 hover:shadow-[0_0_60px_rgba(255,215,0,0.6)]'
              : 'border-2 border-white/30 hover:border-pink-400 hover:shadow-[0_0_50px_rgba(255,42,133,0.4)]'
            : isConnecting
            ? 'border-2 border-amber-400 shadow-[0_0_55px_rgba(255,215,0,0.6)]'
            : state === 'listening'
            ? 'border-2 border-yellow-300 shadow-[0_0_65px_rgba(255,215,0,0.8)]'
            : 'border-2 border-amber-400 shadow-[0_0_75px_rgba(255,255,255,0.9)]'
        }`}
        style={{
          background: `linear-gradient(135deg, ${mood.accentColor} 0%, ${mood.haloColor} 100%)`,
        }}
      >
        {/* Priya Ji Portrait Photo */}
        <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 relative">
          <PriyaPortrait
            size="full"
            styleMode={avatarLook}
            isSpeaking={state === 'speaking'}
            isListening={state === 'listening'}
            audioLevel={micVolume}
          />

          {/* Overlay Status Badge at the bottom of the photo */}
          <div className="absolute inset-x-0 bottom-1 flex justify-center z-20">
            {isOffline ? (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-indigo-400 text-indigo-300 text-[10px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1">
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>Offline / DND</span>
              </span>
            ) : isIdle ? (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-950/85 border border-amber-400/50 text-amber-200 text-[10px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1 group-hover:scale-105 transition-transform">
                <Power className="w-3 h-3 text-amber-400" />
                <span>Jarvis Call</span>
              </span>
            ) : null}

            {!isOffline && isConnecting && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-amber-400/60 text-amber-300 text-[10px] font-mono tracking-wider flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                <span>JARVIS SYNC</span>
              </span>
            )}

            {state === 'listening' && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-300/60 text-amber-200 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-md">
                <Mic className="w-3 h-3 text-amber-300 animate-bounce" />
                <span>At Command...</span>
              </span>
            )}

            {state === 'speaking' && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-yellow-200/60 text-yellow-100 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-md animate-pulse">
                <Volume2 className="w-3 h-3 text-amber-300" />
                <span>Jarvis Speaking</span>
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Prominent Live Video Call Action Button */}
      {onOpenVideoCall && (
        <div className="mt-3.5 z-20 flex items-center gap-2">
          <button
            onClick={onOpenVideoCall}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/25 via-yellow-400/25 to-amber-600/25 hover:from-amber-500/35 hover:to-amber-600/35 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-950/40 active:scale-95 transition-all cursor-pointer"
            title="Start Live Video Call with Piya Ji"
          >
            <Video className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Piya Ji se Video Call 📹</span>
          </button>
        </div>
      )}

      {/* Status banner under orb */}
      <div className="mt-7 flex flex-col items-center text-center px-4 max-w-sm">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-amber-400/30 text-xs text-white/90 shadow-md">
          <span
            className={`w-2 h-2 rounded-full ${
              isIdle
                ? 'bg-amber-400'
                : isConnecting
                ? 'bg-yellow-300 animate-ping'
                : state === 'listening'
                ? 'bg-amber-300 animate-pulse'
                : 'bg-yellow-200 animate-pulse'
            }`}
          />
          <span className="font-semibold tracking-wide text-amber-200">
            {isIdle && 'Jarvis Golden White Protocol • Standby'}
            {isConnecting && 'Initializing Jarvis Neural Voice Core...'}
            {state === 'listening' && (isMuted ? 'Microphone is muted' : 'Jarvis listening... At your command, Sir')}
            {state === 'speaking' && 'Priya Jarvis is speaking with you'}
          </span>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-white/70 font-normal leading-relaxed">
          {isIdle && (
            <span>
              Tap the orb to start live voice session with <strong className="text-amber-300 font-semibold">Priya Jarvis</strong>. Speaks fluent Hindi, English & Hinglish like Tony Stark's AI!
            </span>
          )}
          {isConnecting && 'Opening low-latency audio stream with Gemini Live...'}
          {state === 'listening' && (
            <span>
              {isMuted
                ? 'Unmute to let Priya hear your voice.'
                : 'English ya Hinglish mein bolo—tease her, roast her, ya bolo websites open karne ko! 😉'}
            </span>
          )}
          {state === 'speaking' && (
            <span className="text-rose-200/90">
              "Arey suno toh! Don't interrupt unless you've got something witty to say!" 😉
            </span>
          )}
        </p>

        {/* Quick controls when connected */}
        {isConnected && (
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={onToggleMute}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border backdrop-blur-md ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
              }`}
            >
              {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {isMuted ? 'Unmute Mic' : 'Mute Mic'}
            </button>

            <button
              onClick={onToggleCall}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-red-600/30 text-red-200 border border-red-500/40 hover:bg-red-600/40 transition-colors backdrop-blur-md"
            >
              <Power className="w-3.5 h-3.5" />
              End Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
