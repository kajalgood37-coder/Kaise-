/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { CentralOrb } from './components/CentralOrb';
import { AudioVisualizer } from './components/AudioVisualizer';
import { ActionHUD } from './components/ActionHUD';
import { PersonalityModal } from './components/PersonalityModal';
import { MoodSelectorModal } from './components/MoodSelectorModal';
import { MusicModal } from './components/MusicModal';
import { SettingsModal } from './components/SettingsModal';
import { PhoneCallModal } from './components/PhoneCallModal';
import { CameraPhotoModal } from './components/CameraPhotoModal';
import { VideoCallModal } from './components/VideoCallModal';
import { PriyaPortrait } from './components/PriyaPortrait';
import { FloatingPiyaCompanion } from './components/FloatingPiyaCompanion';
import { GamingCompanionModal } from './components/GamingCompanionModal';
import { ScreenLockModal } from './components/ScreenLockModal';
import { ChatDrawer } from './components/ChatDrawer';
import { ControlPanelModal } from './components/ControlPanelModal';
import { InstallAppModal } from './components/InstallAppModal';
import { MicPermissionModal } from './components/MicPermissionModal';
import { VoiceSelectorModal } from './components/VoiceSelectorModal';
import {
  AssistantState,
  AmbientMood,
  MOOD_PRESETS,
  ToolActionItem,
  AppSettings,
  SongItem,
  ChatMessage,
  AvatarLookStyle,
  VoiceName,
} from './types';
import { speakText } from './utils/speechVoice';
import {
  AudioQueuePlayer,
  downsampleBuffer,
  float32ToPcm16Base64,
  calculateRMS,
} from './utils/audioUtils';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  AlertCircle,
  Download,
  Sparkles,
  Phone,
  PhoneCall,
  PhoneOff,
  Camera,
  Music2,
  Settings,
  Grid,
  Zap,
  Radio,
  Video,
  Gamepad2,
  MessageSquare,
  Moon,
  Sun,
  Lock,
  Sliders,
  Send,
  Mic,
} from 'lucide-react';
import {
  playIncomingRingtone,
  stopRingtone,
  playCallPickupSound,
  playCallEndSound,
} from './utils/soundEffects';

const SETTINGS_STORAGE_KEY = 'priya_settings_v1';
const MUSIC_STORAGE_KEY = 'priya_pinned_songs_v1';

const DEFAULT_SETTINGS: AppSettings = {
  voice: 'Aoede',
  attitudeLevel: 'spicy',
  languageMode: 'hinglish',
  hapticFeedback: true,
  autoLaunchLinks: true,
  highQualityVisualizer: true,
  isUltraProMax: true,
  autoAnswerCalls: false,
  realisticRingtone: true,
  autoCallEnabled: true,
  autoCallIntervalSeconds: 45,
  loudSpeakerBoost: true,
  gamingCompanionEnabled: true,
  jarvisMode: true,
  avatarLook: 'royal-gold',
  isOffline: false,
  autoSpeakChat: true,
};

export default function App() {
  const [state, setState] = useState<AssistantState>('idle');
  const [mood, setMood] = useState<AmbientMood>('golden-white');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Incoming Call State
  const [isIncomingCall, setIsIncomingCall] = useState<boolean>(false);

  // Settings state with localStorage persistence
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Track pinned songs count
  const [pinnedSongsCount, setPinnedSongsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(MUSIC_STORAGE_KEY);
      if (saved) {
        const list = JSON.parse(saved);
        return list.filter((s: SongItem) => s.isPinned).length;
      }
    } catch {
      // ignore
    }
    return 3;
  });

  // Modals & HUD state
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState<boolean>(false);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState<boolean>(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState<boolean>(false);
  const [isGamingModalOpen, setIsGamingModalOpen] = useState<boolean>(false);
  const [isScreenLocked, setIsScreenLocked] = useState<boolean>(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isMicModalOpen, setIsMicModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isPriyaTyping, setIsPriyaTyping] = useState<boolean>(false);
  const [bottomInput, setBottomInput] = useState<string>('');
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [currentAction, setCurrentAction] = useState<ToolActionItem | null>(null);

  // PWA mobile installation hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Audio & WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioPlayerRef = useRef<AudioQueuePlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Stable references for audio callbacks
  const isMutedRef = useRef<boolean>(false);
  isMutedRef.current = isMuted;

  const stateRef = useRef<AssistantState>('idle');
  stateRef.current = state;

  const settingsRef = useRef<AppSettings>(settings);
  settingsRef.current = settings;

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Sync pinned songs count on music modal open/close
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MUSIC_STORAGE_KEY);
      if (saved) {
        const list = JSON.parse(saved);
        setPinnedSongsCount(list.filter((s: SongItem) => s.isPinned).length);
      }
    } catch {
      // ignore
    }
  }, [isMusicModalOpen]);

  // Initialize output audio player
  useEffect(() => {
    const player = new AudioQueuePlayer((isSpeaking) => {
      if (stateRef.current === 'listening' || stateRef.current === 'speaking') {
        setState(isSpeaking ? 'speaking' : 'listening');
      }
    });
    audioPlayerRef.current = player;

    return () => {
      player.close();
    };
  }, []);

  // Update volume when changed (with loud speaker boost support)
  useEffect(() => {
    audioPlayerRef.current?.setVolume(volume, settings.loudSpeakerBoost);
  }, [volume, settings.loudSpeakerBoost]);

  // Haptic feedback trigger helper
  const triggerHaptic = useCallback(() => {
    if (settingsRef.current.hapticFeedback && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
  }, []);

  // Teardown live media streams
  const stopAudioCapture = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      try {
        inputAudioCtxRef.current.close();
      } catch {
        // ignore
      }
      inputAudioCtxRef.current = null;
    }
    setMicVolume(0);
  }, []);

  // Start capturing microphone input
  const startAudioCapture = useCallback(async (ws: WebSocket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      let inputCtx: AudioContext;
      try {
        inputCtx = new AudioCtxClass({ sampleRate: 16000 });
      } catch {
        inputCtx = new AudioCtxClass();
      }
      inputAudioCtxRef.current = inputCtx;

      if (inputCtx.state === 'suspended') {
        await inputCtx.resume();
      }

      const sourceNode = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      sourceNode.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current) {
          setMicVolume(0);
          return;
        }

        const inputChannelData = e.inputBuffer.getChannelData(0);
        const rms = calculateRMS(inputChannelData);
        setMicVolume(rms);

        if (ws.readyState !== WebSocket.OPEN) return;

        const pcmFloat32 = downsampleBuffer(inputChannelData, inputCtx.sampleRate, 16000);
        const base64Pcm = float32ToPcm16Base64(pcmFloat32);

        ws.send(
          JSON.stringify({
            type: 'audio',
            audio: base64Pcm,
          })
        );
      };
    } catch (err: any) {
      console.warn('[App] Failed to access microphone:', err?.name || err?.message || err);
      setIsMicModalOpen(true);
      setErrorMessage(
        'Microphone access blocked. Browser ke 🔒 lock icon par click karke mic Allow karein ya niche "Text Mode" se likh kar baat karein.'
      );
      setState('idle');
      // Gracefully close websocket if microphone is unavailable
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }
  }, []);

  // Stop active call
  const endCall = useCallback(() => {
    stopAudioCapture();
    audioPlayerRef.current?.interrupt();

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState('idle');
  }, [stopAudioCapture]);

  // Start live session call with Priya
  const startCall = useCallback(async () => {
    triggerHaptic();
    setErrorMessage(null);
    setState('connecting');

    audioPlayerRef.current?.init();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live-ws?voice=${settingsRef.current.voice}`;

    console.log('[App] Connecting to WebSocket with voice:', settingsRef.current.voice, wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[App] WebSocket connected, awaiting Live session setup...');
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'ready') {
          console.log('[App] Priya is ready and listening!');
          setState('listening');
          await startAudioCapture(ws);
        } else if (msg.type === 'audio' && msg.audio) {
          audioPlayerRef.current?.enqueueChunk(msg.audio);
        } else if (msg.type === 'transcript' && msg.text) {
          // Live transcription from Priya
          setChatMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.sender === 'priya' && Date.now() - last.timestamp < 3500) {
              return [
                ...prev.slice(0, -1),
                { ...last, text: `${last.text} ${msg.text}` },
              ];
            }
            return [
              ...prev,
              {
                id: `live-${Date.now()}-${Math.random()}`,
                sender: 'priya',
                text: msg.text,
                timestamp: Date.now(),
              },
            ];
          });
        } else if (msg.type === 'interrupted') {
          console.log('[App] Interrupted signal received');
          audioPlayerRef.current?.interrupt();
          setState('listening');
        } else if (msg.type === 'turnComplete') {
          // Model finished speaking its turn
        } else if (msg.type === 'toolCall') {
          console.log('[App] Tool call executed:', msg);
          setCurrentAction({
            id: msg.callId || String(Date.now()),
            name: msg.name,
            args: msg.args || {},
            result: msg.result || {},
            timestamp: Date.now(),
          });
          // Auto open camera if Priya invoked takePhoto
          if (msg.name === 'takePhoto') {
            setIsPhotoModalOpen(true);
          }
        } else if (msg.type === 'error') {
          console.error('[App] Server error received:', msg.message);
          setErrorMessage(msg.message || 'Error communicating with Gemini Live API');
          setState('error');
          endCall();
        }
      } catch (err) {
        console.error('[App] Error parsing WebSocket message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('[App] WebSocket error:', err);
      setErrorMessage('Network connection error. Is the server running?');
      setState('error');
      endCall();
    };

    ws.onclose = () => {
      console.log('[App] WebSocket closed');
      if (stateRef.current !== 'idle' && stateRef.current !== 'error') {
        setState('idle');
      }
      stopAudioCapture();
    };
  }, [startAudioCapture, endCall, triggerHaptic]);

  // Toggle call button
  const handleToggleCall = () => {
    if (state === 'idle' || state === 'error') {
      startCall();
    } else {
      endCall();
    }
  };

  // Interrupt Priya speaking
  const handleInterrupt = () => {
    triggerHaptic();
    audioPlayerRef.current?.interrupt();
    setState('listening');
  };

  // Change Priya's Voice Model
  const handleChangeVoice = (newVoice: string) => {
    setSettings((prev) => ({ ...prev, voice: newVoice as any }));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'changeVoice',
          voice: newVoice,
        })
      );
    }
  };

  // Update Settings Partial
  const handleUpdateSettings = (newPartial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      if (newPartial.voice && newPartial.voice !== prev.voice) {
        handleChangeVoice(newPartial.voice);
      }
      return updated;
    });
  };

  // Ask Priya to play a song
  const handleAskPriyaToPlay = (song: SongItem) => {
    triggerHaptic();
    const actionItem: ToolActionItem = {
      id: `song-${Date.now()}`,
      name: 'playSong',
      args: {
        title: song.title,
        artist: song.artist,
        genre: song.category,
      },
      result: {
        status: 'playing',
        title: song.title,
        artist: song.artist,
        searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${song.title} ${song.artist} song`
        )}`,
      },
      timestamp: Date.now(),
    };
    setCurrentAction(actionItem);

    if (state === 'idle') {
      startCall();
    }
  };

  // Send Photo Snapshot to Priya for live voice reaction
  const handleSendPhotoToPriya = useCallback(
    (base64Jpeg: string) => {
      triggerHaptic();
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'image',
            image: base64Jpeg,
          })
        );
        setCurrentAction({
          id: `photo-${Date.now()}`,
          name: 'takePhoto',
          args: {
            comment: 'Photo Priya ko dikha di! Wo live react kar rahi hai... 📸',
          },
          result: { status: 'sent' },
          timestamp: Date.now(),
        });
      } else {
        // If not connected, start call and then send
        startCall().then(() => {
          setTimeout(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: 'image',
                  image: base64Jpeg,
                })
              );
            }
          }, 1500);
        });
      }
    },
    [triggerHaptic, startCall]
  );

  // Send text message to Priya (via REST or WebSocket)
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      triggerHaptic();
      const userText = text.trim();
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: userText,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, userMsg]);
      setIsPriyaTyping(true);

      // If live WebSocket is connected, also broadcast text to Live session
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'text',
            text: userText,
          })
        );
      }

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            avatarLook: settings.avatarLook,
          }),
        });
        const data = await res.json();
        if (data.reply) {
          const botMsg: ChatMessage = {
            id: `priya-${Date.now()}`,
            sender: 'priya',
            text: data.reply,
            timestamp: Date.now(),
          };
          setChatMessages((prev) => [...prev, botMsg]);

          // "Awaaz bhi bole ismein" - Speak reply out loud if autoSpeakChat is enabled!
          if (settingsRef.current.autoSpeakChat) {
            speakText(data.reply, settingsRef.current.voice, volume);
          }
        }
      } catch (err) {
        console.error('[Chat] Failed to send message:', err);
        const fallbackMsg: ChatMessage = {
          id: `priya-${Date.now()}`,
          sender: 'priya',
          text: 'Arey meri jaan! Main hamesha aapke paas hoon. Kahiye kya sewa karein? 💖✨',
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, fallbackMsg]);
        if (settingsRef.current.autoSpeakChat) {
          speakText(fallbackMsg.text, settingsRef.current.voice, volume);
        }
      } finally {
        setIsPriyaTyping(false);
      }
    },
    [settings.avatarLook, triggerHaptic, volume]
  );

  // Toggle fullscreen mode
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Toggle loudspeaker booster ("Awaaz Bahar")
  const handleToggleLoudspeaker = useCallback(() => {
    triggerHaptic();
    setSettings((prev) => {
      const nextBoost = !prev.loudSpeakerBoost;
      audioPlayerRef.current?.setVolume(volume, nextBoost);
      return { ...prev, loudSpeakerBoost: nextBoost };
    });
  }, [triggerHaptic, volume]);

  // Handle incoming call from Priya (with loud speaker boost support)
  const handleTriggerIncomingCall = useCallback(() => {
    if (state === 'listening' || state === 'speaking') return;
    triggerHaptic();
    setIsIncomingCall(true);
    playIncomingRingtone(settingsRef.current.loudSpeakerBoost);
  }, [state, triggerHaptic]);

  // Autonomous incoming call from Priya ("Khud Piya Ji call lagaye")
  // Automatically calls the user after idle timeout (unless offline or locked)
  useEffect(() => {
    if (!settings.autoCallEnabled || settings.isOffline) return;
    if (state !== 'idle' || isIncomingCall || isVideoCallOpen || isCallModalOpen || isScreenLocked) return;

    const intervalSec = settings.autoCallIntervalSeconds || 45;
    console.log(`[AutoCall] Priya will proactively call in ${intervalSec}s if idle...`);

    const timer = setTimeout(() => {
      if (stateRef.current === 'idle' && !isIncomingCall && !settingsRef.current.isOffline) {
        console.log('[AutoCall] Idle timeout reached! Triggering Priya incoming call...');
        handleTriggerIncomingCall();
      }
    }, intervalSec * 1000);

    return () => clearTimeout(timer);
  }, [
    settings.autoCallEnabled,
    settings.autoCallIntervalSeconds,
    settings.isOffline,
    state,
    isIncomingCall,
    isVideoCallOpen,
    isCallModalOpen,
    isScreenLocked,
    handleTriggerIncomingCall,
  ]);

  // Answer call / "Call Uthaye 🟢"
  const handleAcceptIncomingCall = useCallback(() => {
    stopRingtone();
    playCallPickupSound();
    setIsIncomingCall(false);
    startCall();
    setIsCallModalOpen(true);
  }, [startCall]);

  // Decline call
  const handleDeclineIncomingCall = useCallback(() => {
    stopRingtone();
    playCallEndSound();
    setIsIncomingCall(false);
  }, []);

  const currentMoodConfig = MOOD_PRESETS[mood] || MOOD_PRESETS['golden-white'];

  return (
    <div
      className="relative w-screen h-screen flex flex-col overflow-hidden select-none transition-colors duration-1000 font-['Plus_Jakarta_Sans']"
      style={{
        background: currentMoodConfig.bgGradient,
      }}
    >
      {/* Background radial gradient mesh */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 transition-all duration-1000"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${currentMoodConfig.primaryGlow} 0%, transparent 60%)`,
        }}
      />

      {/* Futuristic subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40" />

      {/* Top Bar Navigation */}
      <TopBar
        state={state}
        mood={currentMoodConfig}
        currentVoice={settings.voice}
        volume={volume}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        pinnedSongsCount={pinnedSongsCount}
        isInstalled={isInstalled}
        isInstallable={isInstallable}
        isOffline={settings.isOffline}
        avatarLook={settings.avatarLook}
        onChangeVoice={handleChangeVoice}
        onOpenMoodModal={() => setIsMoodModalOpen(true)}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
        onOpenMusicModal={() => setIsMusicModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenCallModal={() => setIsCallModalOpen(true)}
        onOpenPhotoModal={() => {
          setCameraMode('photo');
          setIsPhotoModalOpen(true);
        }}
        onOpenVideoCall={() => setIsVideoCallOpen(true)}
        onInstallClick={() => setIsInstallModalOpen(true)}
        onToggleFullscreen={handleToggleFullscreen}
        onChangeVolume={setVolume}
        onToggleOffline={() => {
          triggerHaptic();
          handleUpdateSettings({ isOffline: !settings.isOffline });
        }}
        onLockScreen={() => {
          triggerHaptic();
          setIsScreenLocked(true);
        }}
        onOpenChat={() => {
          triggerHaptic();
          setIsChatDrawerOpen(true);
        }}
        onOpenControlPanel={() => {
          triggerHaptic();
          setIsControlPanelOpen(true);
        }}
        onOpenVoiceModal={() => {
          triggerHaptic();
          setIsVoiceModalOpen(true);
        }}
      />

      {/* Interactive Action Notification HUD */}
      <ActionHUD
        action={currentAction}
        onDismiss={() => setCurrentAction(null)}
        onApplyMood={(newMood) => setMood(newMood)}
        onOpenPhotoModal={() => {
          setCameraMode('photo');
          setIsPhotoModalOpen(true);
        }}
      />

      {/* Main Center Stage */}
      <main className="relative flex-1 flex flex-col items-center justify-center p-3 sm:p-4 z-10 overflow-y-auto">
        {/* Dynamic Canvas Sound Wave & Aura Visualizer */}
        <AudioVisualizer
          state={state}
          mood={currentMoodConfig}
          micVolume={micVolume}
          analyser={audioPlayerRef.current?.getAnalyser() || null}
        />

        {/* Central Glowing Mic / Power Orb with Piya Ji's Portrait Photo */}
        <CentralOrb
          state={state}
          mood={currentMoodConfig}
          isMuted={isMuted}
          micVolume={micVolume}
          avatarLook={settings.avatarLook}
          isOffline={settings.isOffline}
          onToggleCall={handleToggleCall}
          onInterrupt={handleInterrupt}
          onToggleMute={() => {
            triggerHaptic();
            setIsMuted((prev) => !prev);
          }}
          onOpenVideoCall={() => setIsVideoCallOpen(true)}
        />

        {/* Ultra Pro Max Quick Floating Dock */}
        <div className="mt-4 sm:mt-5 z-20 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl bg-slate-950/85 border border-amber-400/30 backdrop-blur-xl shadow-[0_0_35px_rgba(0,0,0,0.6)] max-w-full">
          {/* 1. Video Call with Piya Ji Button */}
          <button
            onClick={() => setIsVideoCallOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/25 via-rose-500/25 to-purple-500/25 hover:from-pink-500/35 hover:to-purple-500/35 border border-pink-400/40 text-pink-300 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Piya Ji se Live Video Call 📹"
          >
            <Video className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>Video Call 📹</span>
          </button>

          {/* 2. Call Uthaye button */}
          <button
            onClick={handleTriggerIncomingCall}
            disabled={state === 'listening' || state === 'speaking' || settings.isOffline}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/25 to-green-500/25 hover:from-emerald-500/35 hover:to-green-500/35 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-40"
            title="Priya Incoming Call - Call Uthaye 🟢"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            <span>Call Uthaye 🟢</span>
          </button>

          {/* 3. Photo & Video Studio Button */}
          <button
            onClick={() => {
              setCameraMode('video');
              setIsPhotoModalOpen(true);
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm"
            title="Video Banane Wala & Photo Studio 🎥📸"
          >
            <Camera className="w-3.5 h-3.5 text-amber-300" />
            <span>Video/Photo 🎥</span>
          </button>

          {/* 4. Chatting Button */}
          <button
            onClick={() => setIsChatDrawerOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            title="Chatting & Messages 💬"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chatting 💬</span>
          </button>

          {/* 5. Controller Panel Button */}
          <button
            onClick={() => setIsControlPanelOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 to-yellow-500/25 hover:from-amber-500/35 hover:to-yellow-500/35 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            title="Master Controller Panel 🎛️"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Controller 🎛️</span>
          </button>

          {/* Voice Switcher Button (Ladka / Ladki ki awaaz) */}
          <button
            onClick={() => {
              triggerHaptic();
              setIsVoiceModalOpen(true);
            }}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm"
            title="Awaaz Chunein - Ladka / Ladki ki Awaaz 🎙️"
          >
            <Mic className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span>
              {settings.voice === 'Puck' || settings.voice === 'Charon' || settings.voice === 'Fenrir'
                ? '👦 Ladka Awaaz'
                : '👧 Ladki Awaaz'}
            </span>
          </button>

          {/* 6. Screen Lock Button */}
          <button
            onClick={() => setIsScreenLocked(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            title="Screen Lock / AOD Blackout 🔒"
          >
            <Lock className="w-3.5 h-3.5 text-yellow-300" />
            <span>Lock 🔒</span>
          </button>

          {/* 7. Gaming Arcade & Pass Aana Companion */}
          <button
            onClick={() => setIsGamingModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            title="Gaming Companion (Pass Aana Chahiye) 🎮"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Games 🎮</span>
          </button>

          {/* 8. Dialer */}
          <button
            onClick={() => setIsCallModalOpen(true)}
            className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs transition-colors cursor-pointer"
            title="Open Phone Dialer 📞"
          >
            <Grid className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* 9. Gane / Songs Lounge */}
          <button
            onClick={() => setIsMusicModalOpen(true)}
            className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs transition-colors cursor-pointer relative"
            title="Music & Songs Lounge 🎶"
          >
            <Music2 className="w-3.5 h-3.5 text-rose-400" />
            {pinnedSongsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {pinnedSongsCount}
              </span>
            )}
          </button>

          {/* 10. Mobile Install Button */}
          {!isInstalled && (
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/35 hover:to-teal-500/35 border border-emerald-400/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Mobile mein Install & Download karein 📲"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Install 📲</span>
            </button>
          )}

          {/* 11. Settings */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Settings ⚙️"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Niche Likhne Wala Persistent Text Input Bar ("Niche likhane wala option") */}
        <div className="w-full max-w-xl mx-auto px-2 sm:px-4 mt-3 z-20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (bottomInput.trim()) {
                handleSendMessage(bottomInput);
                setBottomInput('');
              }
            }}
            className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-slate-950/85 border border-amber-400/35 backdrop-blur-xl shadow-[0_4px_25px_rgba(250,204,21,0.12)] focus-within:border-amber-400 transition-all"
          >
            <input
              type="text"
              value={bottomInput}
              onChange={(e) => setBottomInput(e.target.value)}
              placeholder="Priya se likh kar baat karein... ✍️ (Hinglish/Hindi)"
              className="flex-1 bg-transparent text-xs sm:text-sm text-amber-100 placeholder-white/40 focus:outline-none"
            />
            {bottomInput.trim() ? (
              <button
                type="submit"
                disabled={isPriyaTyping}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <span>Bhejo</span>
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsChatDrawerOpen(true)}
                className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Chat Drawer kholein"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline pr-1">Chatting</span>
              </button>
            )}
          </form>
        </div>

        {/* Error Alert Toast with Actionable Fix & Text Mode Fallback */}
        {errorMessage && (
          <div className="mt-3 z-40 max-w-md w-[92%] p-3 rounded-2xl bg-slate-950/95 border-2 border-amber-400/50 text-amber-100 text-xs flex flex-wrap items-center justify-between gap-2 shadow-2xl backdrop-blur-md animate-in fade-in duration-300">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-[11px] leading-snug">{errorMessage}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setIsMicModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Fix Mic 🎙️
              </button>
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setIsChatDrawerOpen(true);
                }}
                className="px-2 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 font-semibold text-xs transition-colors cursor-pointer"
              >
                Text Chat 💬
              </button>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-white/50 hover:text-white px-1.5 py-1 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Footer Details */}
      <footer className="relative z-20 px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between text-[10px] sm:text-[11px] text-white/40 border-t border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${settings.isOffline ? 'bg-zinc-500' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="font-mono">{settings.isOffline ? 'Offline / DND Mode' : 'Jarvis Golden White Edition'}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setCameraMode('video');
              setIsPhotoModalOpen(true);
            }}
            className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
          >
            <span>🎥 Video Studio</span>
          </button>
          <button
            onClick={() => setIsChatDrawerOpen(true)}
            className="text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1"
          >
            <span>💬 Chat</span>
          </button>
          <button
            onClick={() => setIsControlPanelOpen(true)}
            className="text-yellow-300 hover:text-yellow-200 font-bold flex items-center gap-1"
          >
            <span>🎛️ Controller</span>
          </button>
          <button
            onClick={() => setIsScreenLocked(true)}
            className="text-white/60 hover:text-white font-medium flex items-center gap-1"
          >
            <span>🔒 Lock</span>
          </button>
          {!isInstalled && (
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="text-emerald-300 hover:text-emerald-200 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>📲 Install App</span>
            </button>
          )}
        </div>
      </footer>

      {/* Phone Call Screen Modal */}
      <PhoneCallModal
        isOpen={isCallModalOpen}
        state={state}
        mood={currentMoodConfig}
        isMuted={isMuted}
        onClose={() => setIsCallModalOpen(false)}
        onToggleCall={handleToggleCall}
        onToggleMute={() => {
          triggerHaptic();
          setIsMuted((prev) => !prev);
        }}
        onOpenPhotoBooth={() => {
          setIsCallModalOpen(false);
          setCameraMode('photo');
          setIsPhotoModalOpen(true);
        }}
        onStartCall={() => {
          if (state === 'idle') startCall();
        }}
        onAskPriyaToDial={(name, phone) => {
          setCurrentAction({
            id: `call-${Date.now()}`,
            name: 'makePhoneCall',
            args: {
              contactName: name,
              phoneNumber: phone,
              comment: `Dialing ${name} (${phone})...`,
            },
            result: {
              status: 'dialing',
              contactName: name,
              phoneNumber: phone,
              telUrl: `tel:${phone}`,
              whatsappUrl: `https://wa.me/${phone.replace(/[^0-9]/g, '')}`,
            },
            timestamp: Date.now(),
          });
          if (state === 'idle') startCall();
        }}
      />

      {/* Camera / Photo & Video Studio Modal */}
      <CameraPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSendPhotoToPriya={handleSendPhotoToPriya}
        isCallConnected={state === 'listening' || state === 'speaking'}
        onStartCallIfIdle={startCall}
        initialMode={cameraMode}
      />

      {/* Personality & Banter Modal */}
      <PersonalityModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
      />

      {/* Mood Theme Selector Modal */}
      <MoodSelectorModal
        isOpen={isMoodModalOpen}
        currentMood={mood}
        onSelectMood={(newMood) => setMood(newMood)}
        onClose={() => setIsMoodModalOpen(false)}
      />

      {/* Music & Pinned Gane Modal */}
      <MusicModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        onAskPriyaToPlay={handleAskPriyaToPlay}
      />

      {/* Settings & Mobile App Install Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        settings={settings}
        currentMood={mood}
        volume={volume}
        onUpdateSettings={handleUpdateSettings}
        onChangeVolume={setVolume}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Screen Lock / AMOLED Always-On-Display Modal */}
      <ScreenLockModal
        isOpen={isScreenLocked}
        state={state}
        avatarLook={settings.avatarLook}
        onUnlock={() => setIsScreenLocked(false)}
      />

      {/* Real-Time Chat Drawer */}
      <ChatDrawer
        isOpen={isChatDrawerOpen}
        avatarLook={settings.avatarLook}
        currentVoice={settings.voice}
        onClose={() => setIsChatDrawerOpen(false)}
        onSendMessage={handleSendMessage}
        messages={chatMessages}
        isPriyaTyping={isPriyaTyping}
        onClearChat={() => setChatMessages([])}
      />

      {/* Master Controller Center Modal */}
      <ControlPanelModal
        isOpen={isControlPanelOpen}
        settings={settings}
        volume={volume}
        onUpdateSettings={handleUpdateSettings}
        onChangeVolume={setVolume}
        onClose={() => setIsControlPanelOpen(false)}
        onLockScreen={() => setIsScreenLocked(true)}
        onOpenVideoStudio={() => {
          setCameraMode('video');
          setIsPhotoModalOpen(true);
        }}
        onOpenChat={() => setIsChatDrawerOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
      />

      {/* Mobile Install & Download Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        isInstalled={isInstalled}
        isInstallable={isInstallable}
        isIOS={isIOS}
        avatarLook={settings.avatarLook}
        onClose={() => setIsInstallModalOpen(false)}
        onInstall={install}
      />

      {/* Microphone Permission Required Modal */}
      <MicPermissionModal
        isOpen={isMicModalOpen}
        onClose={() => setIsMicModalOpen(false)}
        onRetry={async () => {
          setIsMicModalOpen(false);
          setErrorMessage(null);
          // Directly request mic stream from browser
          const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          testStream.getTracks().forEach((t) => t.stop());
          // Success! Now start call
          startCall();
        }}
        onOpenTextChat={() => {
          setIsMicModalOpen(false);
          setIsChatDrawerOpen(true);
        }}
        avatarLook={settings.avatarLook}
      />

      {/* Voice Selector Modal (👦 Ladka / 👧 Ladki Awaaz + Awaaz Bhi Bole) */}
      <VoiceSelectorModal
        isOpen={isVoiceModalOpen}
        currentVoice={settings.voice}
        autoSpeakChat={settings.autoSpeakChat}
        onSelectVoice={(voice) => handleChangeVoice(voice)}
        onToggleAutoSpeakChat={(enabled) => handleUpdateSettings({ autoSpeakChat: enabled })}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      {/* REAL-TIME INCOMING CALL SCREEN WITH "CALL UTHAYE 🟢" */}
      {isIncomingCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in zoom-in-95 duration-200 select-none">
          <div className="relative w-full max-w-sm rounded-[38px] bg-slate-950 border-2 border-emerald-400/40 p-6 sm:p-8 flex flex-col items-center justify-between text-center shadow-[0_0_80px_rgba(16,185,129,0.35)] overflow-hidden">
            {/* Pulsating ambient aura */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

            {/* Top Badge */}
            <div className="relative z-10 flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3.5 h-3.5 fill-current animate-bounce text-amber-300" />
              <span>Priya Jarvis Ultra Pro Max Calling...</span>
            </div>

            {/* Pulsing Avatar */}
            <div className="relative z-10 my-4">
              <div className="absolute -inset-4 rounded-full border-2 border-amber-400/50 animate-ping pointer-events-none" />
              <div className="absolute -inset-8 rounded-full border border-yellow-200/40 animate-pulse pointer-events-none" />

              <div className="w-28 h-28 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-[0_0_50px_rgba(250,204,21,0.6)] flex items-center justify-center overflow-hidden">
                <PriyaPortrait size="full" />
              </div>
              <span className="absolute bottom-1 right-2 w-5 h-5 rounded-full bg-amber-400 border-2 border-slate-950 animate-ping" />
            </div>

            <div className="relative z-10 space-y-1 mb-6">
              <h2 className="text-2xl font-extrabold text-white font-['Outfit'] flex items-center justify-center gap-1.5">
                <span>Priya</span>
                <span className="text-amber-400 font-mono text-sm px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30">
                  JARVIS
                </span>
              </h2>
              <p className="text-xs text-amber-200 font-mono flex items-center justify-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                <span>Golden White Jarvis Protocol • VoLTE Live</span>
              </p>
              <p className="text-xs text-amber-100/90 italic mt-3 max-w-xs bg-amber-950/40 p-2.5 rounded-xl border border-amber-400/30 shadow-inner">
                "Sir, aapki Jarvis Priya line par hai! Uthaiye phone, tactical briefing aur gossip ready hai!" 😉⚡
              </p>
            </div>

            {/* Giant Green CALL UTHAYE & Cut Karein Buttons */}
            <div className="relative z-10 flex items-center justify-center gap-10 w-full pt-2">
              {/* Decline Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleDeclineIncomingCall}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-950/80 active:scale-90 transition-all cursor-pointer"
                  title="Cut Karein / Decline"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <span className="text-xs text-rose-300 font-medium">Cut Karein</span>
              </div>

              {/* Call Uthaye 🟢 Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleAcceptIncomingCall}
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.8)] animate-bounce active:scale-95 transition-all font-bold cursor-pointer"
                  title="Call Uthaye 🟢"
                >
                  <PhoneCall className="w-9 h-9 stroke-[2.5]" />
                </button>
                <span className="text-xs text-emerald-300 font-extrabold uppercase tracking-wider">
                  Call Uthaye 🟢
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Video Call with Piya Ji */}
      <VideoCallModal
        isOpen={isVideoCallOpen}
        state={state}
        mood={currentMoodConfig}
        isMuted={isMuted}
        micVolume={micVolume}
        onClose={() => setIsVideoCallOpen(false)}
        onToggleMute={() => {
          triggerHaptic();
          setIsMuted((prev) => !prev);
        }}
        onEndCall={handleToggleCall}
        onStartCallIfIdle={startCall}
      />

      {/* Gaming Arcade & Pass Aana Companion Modal */}
      <GamingCompanionModal
        isOpen={isGamingModalOpen}
        state={state}
        mood={currentMoodConfig}
        micVolume={micVolume}
        loudSpeakerBoost={settings.loudSpeakerBoost}
        autoCallEnabled={settings.autoCallEnabled}
        autoCallSeconds={settings.autoCallIntervalSeconds}
        onClose={() => setIsGamingModalOpen(false)}
        onStartCall={() => {
          setIsGamingModalOpen(false);
          if (state === 'idle') startCall();
        }}
        onToggleLoudspeaker={handleToggleLoudspeaker}
        onUpdateAutoCall={(enabled, seconds) => {
          handleUpdateSettings({
            autoCallEnabled: enabled,
            autoCallIntervalSeconds: seconds,
          });
        }}
      />

      {/* Floating On-Screen Piya Companion ("Jab bhi game khelunga pass aana chahie") */}
      {settings.gamingCompanionEnabled &&
        !isVideoCallOpen &&
        !isCallModalOpen &&
        !isGamingModalOpen &&
        !isIncomingCall && (
          <FloatingPiyaCompanion
            state={state}
            micVolume={micVolume}
            loudSpeakerBoost={settings.loudSpeakerBoost}
            onOpenGamingModal={() => setIsGamingModalOpen(true)}
            onStartCall={() => {
              if (state === 'idle') startCall();
            }}
            onToggleLoudspeaker={handleToggleLoudspeaker}
          />
        )}
    </div>
  );
}
