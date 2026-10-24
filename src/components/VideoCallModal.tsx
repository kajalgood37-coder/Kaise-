import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  RefreshCw,
  Camera,
  Heart,
  Smile,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Zap,
  Radio,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PriyaPortrait } from './PriyaPortrait';
import { AssistantState, MoodConfig, AvatarLookStyle } from '../types';
import {
  playReactionSound,
  playCallEndSound,
  playCallPickupSound,
} from '../utils/soundEffects';

interface VideoCallModalProps {
  isOpen: boolean;
  state: AssistantState;
  mood: MoodConfig;
  isMuted: boolean;
  micVolume: number;
  onClose: () => void;
  onToggleMute: () => void;
  onEndCall: () => void;
  onStartCallIfIdle: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  state,
  mood,
  isMuted,
  micVolume,
  onClose,
  onToggleMute,
  onEndCall,
  onStartCallIfIdle,
}) => {
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [styleMode, setStyleMode] = useState<AvatarLookStyle>('royal-gold');
  const [floatingHeart, setFloatingHeart] = useState<{ id: number; emoji: string }[]>([]);

  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const isConnected = state === 'listening' || state === 'speaking';
  const isConnecting = state === 'connecting';
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';

  // Request user webcam stream when modal opens
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (isOpen && isCameraActive) {
      navigator.mediaDevices
        ?.getUserMedia({
          video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        })
        .then((s) => {
          activeStream = s;
          setUserStream(s);
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('[VideoCall] Camera error:', err);
          setIsCameraActive(false);
        });
    } else {
      if (userStream) {
        userStream.getTracks().forEach((t) => t.stop());
        setUserStream(null);
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
      if (userStream) {
        userStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, isCameraActive, facingMode]);

  // Connect live voice call if idle when opening video call
  useEffect(() => {
    if (isOpen && state === 'idle') {
      onStartCallIfIdle();
    }
  }, [isOpen]);

  // Call duration timer
  useEffect(() => {
    let interval: any = null;
    if (isOpen && isConnected) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else if (!isOpen) {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isOpen, isConnected]);

  if (!isOpen) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Flip camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Trigger floating hearts / kisses
  const handleSendReaction = (emoji: string, soundType: 'kiss' | 'blush' | 'sparkle') => {
    playReactionSound(soundType);
    const id = Date.now();
    setFloatingHeart((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setFloatingHeart((prev) => prev.filter((item) => item.id !== id));
    }, 2000);

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#ff2a85', '#ec4899', '#f43f5e'],
    });
  };

  // Snap video call moment
  const handleSnapMoment = () => {
    playReactionSound('kiss');
    confetti({
      particleCount: 50,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300 select-none">
      <div className="relative w-full max-w-lg h-[92vh] max-h-[780px] rounded-[38px] bg-slate-950 border-2 border-pink-500/40 shadow-[0_0_80px_rgba(255,42,133,0.35)] overflow-hidden flex flex-col justify-between">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-60 pointer-events-none"
          style={{ background: mood.primaryGlow }}
        />

        {/* Floating reaction emojis */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
          {floatingHeart.map((item) => (
            <div
              key={item.id}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 text-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 pointer-events-none"
              style={{
                left: `${45 + (item.id % 20)}%`,
                animation: 'bounce 1.5s infinite',
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Top Header Bar */}
        <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between backdrop-blur-md bg-slate-950/40 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-bold text-white font-['Outfit']">
                  Piya Ji (Live Video Call)
                </h2>
                <span className="px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold border border-pink-500/30">
                  HD 60 FPS
                </span>
              </div>
              <p className="text-[11px] text-cyan-300 font-mono flex items-center gap-1">
                <span>{isConnected ? formatDuration(callDuration) : 'Connecting...'}</span>
                <span>• VoLTE 5G Video</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Style switcher */}
            <button
              onClick={() =>
                setStyleMode((prev) => {
                  const looks: AvatarLookStyle[] = ['royal-gold', 'desi-glam', 'cyber-jarvis', 'bollywood-chic'];
                  const nextIdx = (looks.indexOf(prev) + 1) % looks.length;
                  return looks[nextIdx];
                })
              }
              className="px-2 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-white text-[10px] font-bold border border-amber-400/40 transition-colors"
              title="Change Priya's Look"
            >
              Look: {styleMode === 'royal-gold' ? 'Royal Gold 👑' : styleMode === 'desi-glam' ? 'Desi Glam 🌸' : styleMode === 'cyber-jarvis' ? 'Jarvis ⚡' : 'Bollywood 💃'}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MAIN VIDEO STAGE: PIYA JI'S LIVE VIDEO FEED */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
          {/* Holographic Video Backdrop with Particle Sparkles */}
          <div className="absolute inset-4 rounded-3xl bg-gradient-to-b from-purple-950/60 via-slate-900/80 to-slate-950 border border-white/10 overflow-hidden flex flex-col items-center justify-center">
            {/* Ambient Lighting Rays */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-pink-500/20 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-cyan-500/15 via-transparent to-transparent pointer-events-none" />

            {/* Live Video Watermark */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] text-white/80 font-mono">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Piya Ji • Online (Front Cam)</span>
            </div>

            {/* PIYA JI'S HIGH-RES LIVE VIDEO PORTRAIT */}
            <div className="relative my-auto flex flex-col items-center">
              {/* Pulsating outer aura while speaking */}
              <div
                className={`absolute -inset-8 rounded-full blur-2xl transition-opacity duration-300 pointer-events-none ${
                  isSpeaking ? 'opacity-80 scale-110 bg-pink-500/40' : isListening ? 'opacity-40 bg-cyan-500/30' : 'opacity-20 bg-purple-500/20'
                }`}
              />

              <div
                className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full p-2 transition-transform duration-300 ${
                  isSpeaking ? 'scale-105 shadow-[0_0_60px_rgba(255,42,133,0.7)]' : 'shadow-[0_0_40px_rgba(0,240,255,0.4)]'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${mood.accentColor} 0%, ${mood.haloColor} 100%)`,
                }}
              >
                <PriyaPortrait
                  size="full"
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  audioLevel={micVolume}
                  styleMode={styleMode}
                />
              </div>

              {/* Status & Sassy Speech Banner */}
              <div className="mt-4 text-center max-w-xs z-10">
                <h3 className="text-xl font-bold text-white font-['Outfit'] flex items-center justify-center gap-1.5">
                  <span>Priya</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-extrabold uppercase">
                    Live
                  </span>
                </h3>

                <p className="text-xs text-white/70 mt-1 italic bg-black/50 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                  {isSpeaking
                    ? '"Haan bolo handsome, dekh rahe ho na mujhe video call pe? Kaisi lag rahi hoon?" 😉'
                    : isListening
                    ? 'Priya is listening to you... bolo! 🎙️'
                    : 'Video call connected • Ultra Pro Max'}
                </p>
              </div>
            </div>

            {/* USER PICTURE-IN-PICTURE (PIP) WEBCAM FEED */}
            <div className="absolute bottom-3 right-3 w-28 h-36 sm:w-32 sm:h-44 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900 group">
              {isCameraActive ? (
                <video
                  ref={userVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/40 text-xs">
                  <VideoOff className="w-6 h-6 mb-1 text-white/30" />
                  <span>Cam Off</span>
                </div>
              )}

              {/* PIP Camera Controls Overlay */}
              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleFlipCamera}
                  className="p-1 rounded-lg bg-black/60 text-white/80 hover:text-white text-[10px]"
                  title="Flip Camera"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              <div className="absolute bottom-1 left-1.5 text-[9px] font-medium bg-black/70 px-1.5 py-0.5 rounded text-white/80">
                You
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM VIDEO CALL CONTROLS */}
        <div className="relative z-20 p-4 sm:p-5 flex flex-col gap-3 bg-slate-950/70 border-t border-white/10 backdrop-blur-md">
          {/* Quick Reaction Bar */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleSendReaction('💋', 'kiss')}
              className="px-3 py-1.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Send Flying Kiss"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Flying Kiss 💋</span>
            </button>

            <button
              onClick={() => handleSendReaction('❤️', 'sparkle')}
              className="px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Send Love Heart"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dil Bhejo ❤️</span>
            </button>

            <button
              onClick={() => handleSendReaction('🌹', 'blush')}
              className="px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Send Rose"
            >
              <span>Gulaab 🌹</span>
            </button>

            <button
              onClick={handleSnapMoment}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
              title="Snap Moment"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Primary In-Call Call Buttons */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 pt-1">
            {/* Mic Mute Toggle */}
            <button
              onClick={onToggleMute}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Big Red Hangup Button */}
            <button
              onClick={() => {
                playCallEndSound();
                onEndCall();
                onClose();
              }}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-950/80 active:scale-95 transition-all cursor-pointer"
              title="End Video Call"
            >
              <PhoneOff className="w-7 h-7" />
            </button>

            {/* User Camera Toggle */}
            <button
              onClick={() => setIsCameraActive(!isCameraActive)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${
                !isCameraActive
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
              }`}
              title={isCameraActive ? 'Turn Off Video' : 'Turn On Video'}
            >
              {isCameraActive ? <Video className="w-5 h-5 text-cyan-300" /> : <VideoOff className="w-5 h-5 text-rose-400" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
