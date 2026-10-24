import React from 'react';
import {
  Sparkles,
  Palette,
  Volume2,
  Maximize2,
  Minimize2,
  Radio,
  Music2,
  Settings,
  Download,
  Smartphone,
  Phone,
  PhoneCall,
  Camera,
  Video,
  Mic,
} from 'lucide-react';
import { AssistantState, MoodConfig, AvatarLookStyle } from '../types';
import {
  Moon,
  Sun,
  Lock,
  MessageSquare,
  Sliders,
} from 'lucide-react';
import { PriyaPortrait } from './PriyaPortrait';

interface TopBarProps {
  state: AssistantState;
  mood: MoodConfig;
  currentVoice: string;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  pinnedSongsCount: number;
  isInstalled: boolean;
  isInstallable: boolean;
  isOffline?: boolean;
  avatarLook?: AvatarLookStyle;
  onChangeVoice: (voice: string) => void;
  onOpenMoodModal: () => void;
  onOpenPersonaModal: () => void;
  onOpenMusicModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenCallModal: () => void;
  onOpenPhotoModal: () => void;
  onOpenVideoCall?: () => void;
  onInstallClick: () => void;
  onToggleFullscreen: () => void;
  onChangeVolume: (vol: number) => void;
  onToggleOffline?: () => void;
  onLockScreen?: () => void;
  onOpenChat?: () => void;
  onOpenControlPanel?: () => void;
  onOpenVoiceModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  state,
  mood,
  currentVoice,
  volume,
  isMuted,
  isFullscreen,
  pinnedSongsCount,
  isInstalled,
  isInstallable,
  isOffline = false,
  avatarLook = 'royal-gold',
  onChangeVoice,
  onOpenMoodModal,
  onOpenPersonaModal,
  onOpenMusicModal,
  onOpenSettingsModal,
  onOpenCallModal,
  onOpenPhotoModal,
  onOpenVideoCall,
  onOpenVoiceModal,
  onInstallClick,
  onToggleFullscreen,
  onChangeVolume,
  onToggleOffline,
  onLockScreen,
  onOpenChat,
  onOpenControlPanel,
}) => {
  const isConnected = state === 'listening' || state === 'speaking';
  const isConnecting = state === 'connecting';

  return (
    <header className="relative z-30 w-full px-3 py-2.5 sm:px-6 sm:py-3.5 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-slate-950/40">
      {/* Brand & Persona Info */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="relative">
          <div
            className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg border border-pink-400/40 transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${mood.accentColor} 0%, ${mood.haloColor} 100%)`,
            }}
          >
            <PriyaPortrait
              size="sm"
              styleMode={avatarLook}
              isSpeaking={state === 'speaking'}
              isListening={state === 'listening'}
            />
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
              isOffline
                ? 'bg-slate-400'
                : isConnected
                ? 'bg-emerald-400 animate-pulse'
                : isConnecting
                ? 'bg-amber-400 animate-ping'
                : 'bg-emerald-400'
            }`}
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-['Outfit'] flex items-center gap-1">
              <span>Priya</span>
              <span className="text-amber-300 font-mono text-xs">JARVIS</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-slate-950 shadow-sm shadow-amber-500/30">
              Golden White ⚡
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-amber-200/70 flex items-center gap-1.5 font-medium">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>{isOffline ? 'Jarvis Offline (DND / Sleep Mode)' : 'Jarvis AI Voice & Vision • 5G Live'}</span>
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Online / Offline Switch ("Jaanway offline ho jaaun") */}
        {onToggleOffline && (
          <button
            onClick={onToggleOffline}
            title={isOffline ? 'Go Online' : 'Go Offline (Sleep / Do Not Disturb)'}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isOffline
                ? 'bg-indigo-950/80 border border-indigo-400 text-indigo-300'
                : 'bg-emerald-500/15 border border-emerald-400/40 text-emerald-300'
            }`}
          >
            {isOffline ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
          </button>
        )}

        {/* Screen Lock ("band bhi kar sake screen") */}
        {onLockScreen && (
          <button
            onClick={onLockScreen}
            title="Screen Lock / Screen Band (Always-On Display)"
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300/80 hover:text-amber-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Lock</span>
          </button>
        )}

        {/* Chat Drawer Button ("chatting karne wala option") */}
        {onOpenChat && (
          <button
            onClick={onOpenChat}
            title="Open Chat with Priya"
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Chat</span>
          </button>
        )}

        {/* Controller Panel Button ("controller panel aur badhiya banaa do") */}
        {onOpenControlPanel && (
          <button
            onClick={onOpenControlPanel}
            title="Open Master Controller Panel"
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-400/20 to-yellow-500/20 hover:from-amber-400/30 hover:to-yellow-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Control</span>
          </button>
        )}

        {/* Video Call Button */}
        {onOpenVideoCall && (
          <button
            onClick={onOpenVideoCall}
            title="Start Live Video Call with Priya Jarvis"
            className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Video className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden xs:inline">Video Call</span>
          </button>
        )}

        {/* Phone Call Screen Button */}
        <button
          onClick={onOpenCallModal}
          title={isConnected ? 'Active Call Details' : 'Open Phone Call Dialer'}
          className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            isConnected
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-emerald-950/40 animate-pulse'
              : isConnecting
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
              : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
          }`}
        >
          {isConnected ? (
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="hidden xs:inline sm:inline">
            {isConnected ? 'In Call' : isConnecting ? 'Calling...' : 'Call Priya'}
          </span>
        </button>

        {/* Photo Khincho / Camera Button */}
        <button
          onClick={onOpenPhotoModal}
          title="Take Photo / Selfie with Priya"
          className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden sm:inline">Photo</span>
        </button>

        {/* Pinned Songs / Gane Lounge Button */}
        <button
          onClick={onOpenMusicModal}
          title="Pinned Songs & Gane Lounge"
          className="relative px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Music2 className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden md:inline">Gane</span>
          {pinnedSongsCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pinnedSongsCount}
            </span>
          )}
        </button>

        {/* Voice Selector switch (Ladka / Ladki ki awaaz) */}
        {onOpenVoiceModal && (
          <button
            onClick={onOpenVoiceModal}
            title={`Awaaz: ${currentVoice} (Ladka / Ladki ki awaaz badlein)`}
            className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden sm:inline">
              {currentVoice === 'Puck' || currentVoice === 'Charon' || currentVoice === 'Fenrir'
                ? '👦 Ladka'
                : '👧 Ladki'}
            </span>
          </button>
        )}

        {/* Ambient Mood switch */}
        <button
          onClick={onOpenMoodModal}
          title="Change Ambient Theme"
          className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline">{mood.name}</span>
        </button>

        {/* Mobile Install App Button */}
        {!isInstalled && (
          <button
            onClick={onInstallClick}
            title="Mobile mein Install aur Download karein"
            className="px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/35 hover:to-teal-500/35 border border-emerald-400/50 text-emerald-300 text-xs font-bold flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Install 📲</span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettingsModal}
          title="Open Settings"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="hidden sm:flex p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
