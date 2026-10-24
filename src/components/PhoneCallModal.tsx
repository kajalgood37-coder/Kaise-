import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  PhoneOff,
  PhoneCall,
  Mic,
  MicOff,
  Camera,
  Radio,
  Delete,
  User,
  Plus,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Users,
  Grid,
  Video,
  VideoOff,
  Clock,
  Flame,
  Volume2,
  Heart,
  Smile,
  Zap,
  Smartphone,
} from 'lucide-react';
import { AssistantState, MoodConfig, CallLogItem } from '../types';
import { PriyaPortrait } from './PriyaPortrait';
import {
  playIncomingRingtone,
  playOutgoingRing,
  playCallPickupSound,
  playCallEndSound,
  playReactionSound,
  stopRingtone,
} from '../utils/soundEffects';

interface PhoneCallModalProps {
  isOpen: boolean;
  state: AssistantState;
  mood: MoodConfig;
  isMuted: boolean;
  onClose: () => void;
  onToggleCall: () => void;
  onToggleMute: () => void;
  onOpenPhotoBooth: () => void;
  onStartCall: () => void;
  onAskPriyaToDial?: (name: string, phone: string) => void;
}

interface ContactItem {
  id: string;
  name: string;
  phone: string;
  tag: string;
  avatarBg: string;
}

const DEFAULT_CONTACTS: ContactItem[] = [
  { id: 'c-0', name: 'Priya (Ultra Pro Max) 💖', phone: '1001', tag: 'AI Companion', avatarBg: 'from-pink-500 via-rose-500 to-purple-600' },
  { id: 'c-1', name: 'Mummy 🏠', phone: '9876543210', tag: 'Family', avatarBg: 'from-amber-500 to-rose-500' },
  { id: 'c-2', name: 'Papa 👔', phone: '9812345678', tag: 'Family', avatarBg: 'from-blue-500 to-indigo-600' },
  { id: 'c-3', name: 'Rahul (Bestie) 🤝', phone: '9123456789', tag: 'Friend', avatarBg: 'from-emerald-500 to-teal-600' },
  { id: 'c-4', name: 'Pizza Delivery 🍕', phone: '9988776655', tag: 'Food', avatarBg: 'from-orange-500 to-red-500' },
  { id: 'c-5', name: 'Police / Emergency 🚨', phone: '112', tag: 'Emergency', avatarBg: 'from-red-600 to-rose-700' },
  { id: 'c-6', name: 'Doctor / Ambulance 🚑', phone: '108', tag: 'Health', avatarBg: 'from-cyan-500 to-blue-600' },
  { id: 'c-7', name: 'Boss (Office) 💼', phone: '9876500000', tag: 'Work', avatarBg: 'from-purple-600 to-slate-700' },
];

const CONTACTS_STORAGE_KEY = 'priya_saved_contacts_v2';
const CALL_LOG_STORAGE_KEY = 'priya_call_log_v1';

export const PhoneCallModal: React.FC<PhoneCallModalProps> = ({
  isOpen,
  state,
  mood,
  isMuted,
  onClose,
  onToggleCall,
  onToggleMute,
  onOpenPhotoBooth,
  onStartCall,
  onAskPriyaToDial,
}) => {
  const [activeTab, setActiveTab] = useState<'priya' | 'keypad' | 'contacts' | 'history'>('priya');
  const [dialedNumber, setDialedNumber] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isSimulatedIncoming, setIsSimulatedIncoming] = useState<boolean>(false);
  const [isVideoMode, setIsVideoMode] = useState<boolean>(false);
  const [scheduledTimer, setScheduledTimer] = useState<number | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [autoAnswer, setAutoAnswer] = useState<boolean>(false);

  // In-app calling state to any dialed number or contact
  const [customCallContact, setCustomCallContact] = useState<{ name: string; phone: string; avatarBg: string } | null>(null);
  const [isCustomDialing, setIsCustomDialing] = useState<boolean>(false);
  const [contactSearchQuery, setContactSearchQuery] = useState<string>('');

  // Call Logs
  const [callLogs, setCallLogs] = useState<CallLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(CALL_LOG_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'cl-1',
        name: 'Priya (AI Girlfriend)',
        type: 'incoming',
        timestamp: Date.now() - 3600000,
        duration: 214,
        note: 'Super flirty banter & music suggestions',
      },
    ];
  });

  // Contacts list
  const [contacts, setContacts] = useState<ContactItem[]>(() => {
    try {
      const saved = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_CONTACTS;
  });

  // New contact form state
  const [showAddContact, setShowAddContact] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');

  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
  const isConnected = state === 'listening' || state === 'speaking';
  const isConnecting = state === 'connecting' || isCustomDialing;
  const isIdle = state === 'idle' && !isCustomDialing;

  // Save contacts & call logs
  useEffect(() => {
    try {
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
      localStorage.setItem(CALL_LOG_STORAGE_KEY, JSON.stringify(callLogs));
    } catch {
      // ignore
    }
  }, [contacts, callLogs]);

  // Audio ringtone handling when simulated incoming call or connecting
  useEffect(() => {
    if (isSimulatedIncoming) {
      playIncomingRingtone();
      // Auto-answer after 4 seconds if enabled
      let autoTimer: any = null;
      if (autoAnswer) {
        autoTimer = setTimeout(() => {
          handleAcceptIncoming();
        }, 4000);
      }
      return () => {
        stopRingtone();
        if (autoTimer) clearTimeout(autoTimer);
      };
    } else if (isConnecting) {
      playOutgoingRing();
      return () => {
        stopRingtone();
      };
    } else if (isConnected) {
      stopRingtone();
    } else {
      stopRingtone();
    }
  }, [isSimulatedIncoming, isConnecting, isConnected, autoAnswer]);

  // Handle Video Camera stream when Video Call Mode is enabled
  useEffect(() => {
    if (isVideoMode && isOpen) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        .then((s) => {
          setCameraStream(s);
          if (pipVideoRef.current) {
            pipVideoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setIsVideoMode(false);
        });
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
        setCameraStream(null);
      }
    }
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isVideoMode, isOpen]);

  // Call duration counter and log call when ended
  useEffect(() => {
    let timer: any = null;
    if (isConnected) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callDuration > 2) {
        // Log finished call
        const newLog: CallLogItem = {
          id: `log-${Date.now()}`,
          name: 'Priya (Ultra Pro Max)',
          type: 'outgoing',
          timestamp: Date.now(),
          duration: callDuration,
          note: 'Voice-to-voice call completed',
        };
        setCallLogs((prev) => [newLog, ...prev.slice(0, 19)]);
      }
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isConnected]);

  // Handle scheduled fake call from Priya
  const handleScheduleFakeCall = (seconds: number) => {
    setScheduledTimer(seconds);
    onClose();
    const timer = setInterval(() => {
      setScheduledTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setIsSimulatedIncoming(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!isOpen && !isSimulatedIncoming) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // User taps "Call Uthaye 🟢"
  const handleAcceptIncoming = () => {
    stopRingtone();
    playCallPickupSound();
    setIsSimulatedIncoming(false);
    onStartCall();

    const newLog: CallLogItem = {
      id: `log-${Date.now()}`,
      name: 'Priya (Incoming)',
      type: 'incoming',
      timestamp: Date.now(),
      note: 'Call answered by user',
    };
    setCallLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  // User declines incoming call
  const handleDeclineIncoming = () => {
    stopRingtone();
    playCallEndSound();
    setIsSimulatedIncoming(false);

    const newLog: CallLogItem = {
      id: `log-${Date.now()}`,
      name: 'Priya (Missed)',
      type: 'missed',
      timestamp: Date.now(),
      note: 'User declined call',
    };
    setCallLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  // End active call
  const handleHangup = () => {
    stopRingtone();
    playCallEndSound();
    setCustomCallContact(null);
    setIsCustomDialing(false);
    onToggleCall();
  };

  // In-App Call to ANY contact or dialed number
  const handleInAppCall = (name: string, phone: string, avatarBg = 'from-cyan-500 to-blue-600') => {
    stopRingtone();
    setCustomCallContact({ name, phone, avatarBg });
    setIsCustomDialing(true);
    setActiveTab('priya');
    playOutgoingRing();

    // Simulate realistic 2.2s network ringing before connection
    setTimeout(() => {
      setIsCustomDialing(false);
      stopRingtone();
      playCallPickupSound();
      onStartCall();

      if (onAskPriyaToDial) {
        onAskPriyaToDial(name, phone);
      }

      const newLog: CallLogItem = {
        id: `log-${Date.now()}`,
        name: `${name} (${phone})`,
        phone,
        type: 'outgoing',
        timestamp: Date.now(),
        note: 'In-App Ultra Pro Max Call connected',
      };
      setCallLogs((prev) => [newLog, ...prev.slice(0, 19)]);
    }, 2200);
  };

  // Play keypad tone sound
  const playKeyTone = (freq = 440) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
      }
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // ignore
    }
  };

  const handleKeyPress = (digit: string, freq: number) => {
    playKeyTone(freq);
    setDialedNumber((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const handleDirectDial = (phoneToCall?: string) => {
    const phone = phoneToCall || `${countryCode}${dialedNumber}`;
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsAppCall = (phoneToCall?: string) => {
    const raw = (phoneToCall || `${countryCode}${dialedNumber}`).replace(/[^0-9]/g, '');
    if (!raw) return;
    window.open(`https://wa.me/${raw}`, '_blank');
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newContact: ContactItem = {
      id: `c-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.replace(/[^0-9+]/g, ''),
      tag: 'Custom',
      avatarBg: 'from-pink-500 to-purple-600',
    };

    setContacts((prev) => [newContact, ...prev]);
    setNewName('');
    setNewPhone('');
    setShowAddContact(false);
  };

  const keypadButtons = [
    { digit: '1', letters: '', freq: 697 },
    { digit: '2', letters: 'ABC', freq: 770 },
    { digit: '3', letters: 'DEF', freq: 852 },
    { digit: '4', letters: 'GHI', freq: 697 },
    { digit: '5', letters: 'JKL', freq: 770 },
    { digit: '6', letters: 'MNO', freq: 852 },
    { digit: '7', letters: 'PQRS', freq: 697 },
    { digit: '8', letters: 'TUV', freq: 770 },
    { digit: '9', letters: 'WXYZ', freq: 852 },
    { digit: '*', letters: '', freq: 941 },
    { digit: '0', letters: '+', freq: 770 },
    { digit: '#', letters: '', freq: 941 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div
        className="relative w-full max-w-sm sm:max-w-md h-[640px] sm:h-[680px] rounded-[38px] border-2 border-cyan-400/30 shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col justify-between p-5 sm:p-6"
        style={{
          background: mood.bgGradient,
        }}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-50 pointer-events-none"
          style={{ background: mood.primaryGlow }}
        />

        {/* Top Header Bar & Tabs */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between text-xs text-white/70">
            <div className="flex items-center gap-1.5 font-mono font-bold">
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 text-slate-950 text-[10px] uppercase tracking-wider font-extrabold shadow-md flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> Ultra Pro Max
              </span>
              <span className="text-[11px] text-cyan-300">VoLTE 5G+</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-4 p-1 rounded-2xl bg-black/50 border border-white/10 text-[11px] font-semibold">
            <button
              onClick={() => setActiveTab('priya')}
              className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'priya'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <PhoneCall className="w-3 h-3" />
              <span>Priya</span>
            </button>

            <button
              onClick={() => setActiveTab('keypad')}
              className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'keypad'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Grid className="w-3 h-3" />
              <span>Keypad</span>
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'contacts'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Contacts</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PRIYA LIVE VOICE CALL WITH "CALL UTHAYE" FLOW */}
        {activeTab === 'priya' && (
          <>
            {isSimulatedIncoming ? (
              /* REALISTIC INCOMING CALL SCREEN WITH "CALL UTHAYE" BUTTON */
              <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center animate-in zoom-in-95 duration-300">
                <div className="relative mb-6">
                  {/* Outer pulsating wave rings */}
                  <div className="absolute -inset-4 rounded-full border-2 border-pink-500/40 animate-ping" />
                  <div className="absolute -inset-8 rounded-full border border-cyan-400/30 animate-pulse" />

                  <div className="w-28 h-28 rounded-full border-4 border-pink-400/80 p-1 shadow-[0_0_40px_rgba(255,42,133,0.6)] overflow-hidden">
                    <PriyaPortrait size="full" />
                  </div>
                  <span className="absolute bottom-1 right-2 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
                </div>

                <div className="inline-block px-3 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                  Incoming Voice Call
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                  Priya (AI Girlfriend)
                </h3>
                <p className="text-xs text-cyan-300 font-mono mt-1 animate-pulse">
                  Ringing... (Ultra Pro Max) 📞
                </p>

                <p className="text-xs text-white/80 mt-3 max-w-xs italic bg-white/5 p-2 rounded-xl border border-white/10">
                  "Uthao na phone handsome! Miss kar rahi thi tumhe, kitna wait karwaoge?" 😉
                </p>

                {/* BIG "CALL UTHAYE" / DECLINE BUTTONS */}
                <div className="mt-8 flex items-center justify-center gap-12 w-full">
                  {/* Decline */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={handleDeclineIncoming}
                      className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-950/80 active:scale-90 transition-all cursor-pointer"
                      title="Decline Call"
                    >
                      <PhoneOff className="w-7 h-7" />
                    </button>
                    <span className="text-xs text-rose-300 font-medium">Cut Karein</span>
                  </div>

                  {/* Accept / Call Uthaye */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={handleAcceptIncoming}
                      className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-slate-950 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.7)] animate-bounce active:scale-95 transition-all font-bold cursor-pointer"
                      title="Call Uthaye"
                    >
                      <PhoneCall className="w-9 h-9 stroke-[2.5]" />
                    </button>
                    <span className="text-xs text-emerald-300 font-extrabold tracking-wide uppercase">
                      Call Uthaye 🟢
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* OUTGOING / IN-CALL ACTIVE SCREEN */
              <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center w-full">
                {/* Video Mode Screen if Enabled */}
                {isVideoMode ? (
                  <div className="relative w-full h-56 rounded-3xl overflow-hidden border-2 border-cyan-400/40 shadow-2xl mb-3 bg-black flex items-center justify-center">
                    {/* Simulated 3D/Holographic Priya Video Avatar */}
                    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
                      <div
                        className="w-28 h-28 rounded-full p-1 shadow-[0_0_50px_rgba(0,240,255,0.7)] animate-pulse overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${mood.accentColor} 0%, ${mood.haloColor} 100%)`,
                        }}
                      >
                        <PriyaPortrait
                          size="full"
                          isSpeaking={state === 'speaking'}
                          isListening={state === 'listening'}
                        />
                      </div>

                      <div className="mt-2 text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>Priya Hologram Video (60 FPS)</span>
                      </div>
                    </div>

                    {/* PIP User Front Camera */}
                    <div className="absolute top-2 right-2 w-20 h-28 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg bg-slate-900">
                      <video
                        ref={pipVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                      <span className="absolute bottom-1 left-1.5 text-[9px] bg-black/60 px-1 rounded text-white/70">
                        You
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Audio Mode Avatar Screen */
                  <div className="relative mb-4">
                    <div
                      className={`w-32 h-32 rounded-full p-1.5 transition-all duration-500 overflow-hidden ${
                        state === 'speaking'
                          ? 'scale-110 shadow-[0_0_60px_rgba(255,42,133,0.8)]'
                          : isConnected
                          ? 'shadow-[0_0_40px_rgba(0,240,255,0.6)]'
                          : 'shadow-lg'
                      }`}
                      style={{
                        background: customCallContact
                          ? undefined
                          : `linear-gradient(135deg, ${mood.accentColor} 0%, ${mood.haloColor} 100%)`,
                      }}
                    >
                      {customCallContact ? (
                        <div
                          className={`w-full h-full rounded-full flex items-center justify-center font-bold text-white text-4xl font-['Outfit'] bg-gradient-to-tr ${customCallContact.avatarBg}`}
                        >
                          {customCallContact.name.charAt(0)}
                        </div>
                      ) : (
                        <PriyaPortrait
                          size="full"
                          isSpeaking={state === 'speaking'}
                          isListening={state === 'listening'}
                        />
                      )}
                    </div>

                    <span
                      className={`absolute bottom-1 right-2 w-5 h-5 rounded-full border-2 border-slate-950 ${
                        isConnected
                          ? 'bg-emerald-400 animate-pulse'
                          : isConnecting
                          ? 'bg-amber-400 animate-ping'
                          : 'bg-slate-400'
                      }`}
                    />
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white font-['Outfit'] flex items-center justify-center gap-1.5">
                  <span>{customCallContact ? customCallContact.name : 'Priya'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40">
                    Pro Max
                  </span>
                </h3>

                <p className="text-xs text-white/60 mt-1">
                  {isIdle && 'Ready to call • Ultra Pro Max Girlfriend'}
                  {isConnecting && (
                    <span className="text-amber-300 animate-pulse">
                      Calling {customCallContact ? customCallContact.name : 'Priya'}... Connecting VoLTE
                    </span>
                  )}
                  {isConnected && (
                    <span className="text-emerald-400 font-mono font-semibold text-sm">
                      {formatDuration(callDuration)}
                    </span>
                  )}
                </p>

                {/* Pick-up dialog banner */}
                {isConnected && callDuration <= 8 && (
                  <div className="mt-2 text-xs font-semibold text-rose-200 bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/40 animate-pulse">
                    {customCallContact
                      ? `"Call connect ho gaya! Priya AI operator is on line with ${customCallContact.name}."`
                      : `"Haan bolo handsome, utha liya phone! Miss kiya na?" 😉`}
                  </div>
                )}

                {state === 'speaking' && callDuration > 8 && (
                  <div className="mt-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold animate-pulse">
                    {customCallContact ? `${customCallContact.name} is on line... 🎙️` : 'Priya is talking... 🎙️'}
                  </div>
                )}

                {/* Soundboard Reactions in Ultra Pro Max */}
                {isConnected && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button
                      onClick={() => playReactionSound('kiss')}
                      className="px-2.5 py-1 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
                      title="Send Flying Kiss"
                    >
                      <Heart className="w-3 h-3 fill-current" />
                      <span>Kiss</span>
                    </button>
                    <button
                      onClick={() => playReactionSound('whistle')}
                      className="px-2.5 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
                      title="Whistle"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Whistle</span>
                    </button>
                    <button
                      onClick={() => playReactionSound('blush')}
                      className="px-2.5 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
                      title="Blush"
                    >
                      <Smile className="w-3 h-3" />
                      <span>Blush</span>
                    </button>
                  </div>
                )}

                {/* Call simulator trigger when idle */}
                {isIdle && (
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setIsSimulatedIncoming(true)}
                      className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-semibold hover:bg-pink-500/30 transition-colors"
                    >
                      Priya Call Me Now 📞
                    </button>

                    <button
                      onClick={() => handleScheduleFakeCall(10)}
                      className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium hover:bg-cyan-500/30 transition-colors"
                    >
                      Call in 10s
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Controls for Priya Call */}
            {!isSimulatedIncoming && (
              <div className="relative z-10 flex flex-col items-center gap-3">
                {isConnected ? (
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      {/* Mute button */}
                      <button
                        onClick={onToggleMute}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border ${
                          isMuted
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                        }`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>

                      {/* Video Call Mode Toggle */}
                      <button
                        onClick={() => setIsVideoMode(!isVideoMode)}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border ${
                          isVideoMode
                            ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-950/50'
                            : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                        }`}
                        title="Toggle Video Call Mode"
                      >
                        {isVideoMode ? <Video className="w-4 h-4 text-cyan-300" /> : <VideoOff className="w-4 h-4" />}
                      </button>

                      {/* Photo Booth button during call */}
                      <button
                        onClick={onOpenPhotoBooth}
                        className="w-11 h-11 rounded-2xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 flex items-center justify-center transition-all shadow-md shadow-pink-950/40"
                        title="Photo Khincho 📸"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Big Red End Call Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={handleHangup}
                        className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-950/80 active:scale-95 transition-all cursor-pointer"
                        title="End Call"
                      >
                        <PhoneOff className="w-7 h-7" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center gap-2">
                    <button
                      onClick={onToggleCall}
                      disabled={isConnecting}
                      className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.6)] active:scale-95 transition-all font-bold cursor-pointer"
                      title="Call Priya"
                    >
                      <Phone className="w-7 h-7 fill-current" />
                    </button>
                    <span className="text-xs text-white/60 font-medium">
                      {isConnecting ? 'Calling Priya...' : 'Call Priya Now'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* TAB 2: FULL KEYPAD (DIAL ANY NUMBER) */}
        {activeTab === 'keypad' && (
          <div className="relative z-10 flex flex-col justify-between flex-1 py-1">
            {/* Number Input Screen */}
            <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="text-xs font-mono font-bold text-cyan-400">{countryCode}</span>
                <input
                  type="tel"
                  placeholder="Enter any phone number..."
                  value={dialedNumber}
                  onChange={(e) => setDialedNumber(e.target.value.replace(/[^0-9*#+]/g, ''))}
                  className="bg-transparent text-lg sm:text-xl font-mono font-bold text-white tracking-widest focus:outline-none w-full"
                />
              </div>

              {dialedNumber && (
                <button
                  onClick={handleBackspace}
                  className="p-1.5 text-white/50 hover:text-white transition-colors"
                >
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Keypad Grid (3x4) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 my-auto">
              {keypadButtons.map((btn) => (
                <button
                  key={btn.digit}
                  onClick={() => handleKeyPress(btn.digit, btn.freq)}
                  className="h-12 sm:h-14 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/20 border border-white/10 flex flex-col items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <span className="text-lg sm:text-xl font-bold text-white font-mono leading-none">
                    {btn.digit}
                  </span>
                  {btn.letters && (
                    <span className="text-[9px] text-white/40 tracking-widest mt-0.5">
                      {btn.letters}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Call Action Buttons */}
            <div className="space-y-2 pt-2">
              {/* PRIMARY: In-App AI Call to ANY Number */}
              <button
                onClick={() => handleInAppCall(`Number ${dialedNumber}`, `${countryCode}${dialedNumber}`)}
                disabled={!dialedNumber}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 disabled:opacity-40 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/60 active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>In-App Voice Call (Kisi ko bhi Call Lagayein) 📞</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Direct SIM Phone Call */}
                <button
                  onClick={() => handleDirectDial()}
                  disabled={!dialedNumber}
                  className="flex-1 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  title="Dial on Phone SIM Network"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SIM Phone Call</span>
                </button>

                {/* WhatsApp Call */}
                <button
                  onClick={() => handleWhatsAppCall()}
                  disabled={!dialedNumber}
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  title="Call on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Call</span>
                </button>
              </div>

              {/* Ask Priya to Dial Voice Prompt */}
              {dialedNumber && (
                <button
                  onClick={() => {
                    if (onAskPriyaToDial) {
                      onAskPriyaToDial(`Number ${dialedNumber}`, dialedNumber);
                    }
                    handleInAppCall(`Number ${dialedNumber}`, `${countryCode}${dialedNumber}`);
                  }}
                  className="w-full py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Priya live connects this call</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CONTACTS LIST & SPEED DIAL */}
        {activeTab === 'contacts' && (
          <div className="relative z-10 flex flex-col justify-between flex-1 py-1">
            <div className="flex items-center justify-between mb-2 gap-2">
              <input
                type="text"
                placeholder="Search contact or number..."
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none"
              />
              <button
                onClick={() => setShowAddContact(!showAddContact)}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Add Contact Form */}
            {showAddContact && (
              <form
                onSubmit={handleSaveContact}
                className="p-3 rounded-2xl bg-slate-900 border border-white/10 space-y-2 mb-2 animate-in slide-in-from-top-2 duration-200"
              >
                <input
                  type="text"
                  placeholder="Contact Name (e.g. Bestie)..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none"
                  autoFocus
                />
                <input
                  type="tel"
                  placeholder="Phone Number (e.g. 9876543210)..."
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddContact(false)}
                    className="px-3 py-1 rounded-lg text-xs text-white/50 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {/* Contacts list with 1-click In-App Call, SIM, WhatsApp */}
            <div className="overflow-y-auto space-y-2 flex-1 pr-1 max-h-[350px] scrollbar-none">
              {contacts
                .filter(
                  (c) =>
                    c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                    c.phone.includes(contactSearchQuery)
                )
                .map((contact) => (
                  <div
                    key={contact.id}
                    className="p-2 sm:p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white bg-gradient-to-tr ${contact.avatarBg} shrink-0 shadow-md`}
                      >
                        {contact.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-white truncate">
                          {contact.name}
                        </div>
                        <div className="text-[10px] font-mono text-white/50">{contact.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* In-App AI Call button */}
                      <button
                        onClick={() => handleInAppCall(contact.name, contact.phone, contact.avatarBg)}
                        className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 hover:from-emerald-500/40 hover:to-cyan-500/40 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
                        title="In-App AI Call with Priya"
                      >
                        <Phone className="w-3.5 h-3.5 fill-current" />
                        <span>Call</span>
                      </button>

                      {/* SIM call */}
                      <button
                        onClick={() => handleDirectDial(contact.phone)}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
                        title="Direct SIM Phone Call"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>

                      {/* WhatsApp call */}
                      <button
                        onClick={() => handleWhatsAppCall(contact.phone)}
                        className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors"
                        title="WhatsApp Call"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <p className="text-[10px] text-white/40 text-center pt-2">
              Say: <em>"Priya, Mummy ko call lagao"</em> anytime to dial automatically!
            </p>
          </div>
        )}

        {/* TAB 4: RECENT CALL HISTORY */}
        {activeTab === 'history' && (
          <div className="relative z-10 flex flex-col justify-between flex-1 py-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50 font-medium">Recent Calls Log</span>
              <button
                onClick={() => setCallLogs([])}
                className="text-[10px] text-white/40 hover:text-white/70"
              >
                Clear History
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1 max-h-[380px] scrollbar-none">
              {callLogs.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-xs">
                  No call logs yet. Make your first call with Priya!
                </div>
              ) : (
                callLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                          log.type === 'incoming'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.type === 'missed'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}
                      >
                        {log.type === 'missed' ? (
                          <PhoneOff className="w-4 h-4" />
                        ) : (
                          <PhoneCall className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{log.name}</div>
                        <div className="text-[10px] text-white/50">
                          {log.duration ? `${formatDuration(log.duration)} • ` : ''}
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('priya');
                        onStartCall();
                      }}
                      className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-medium"
                    >
                      Redial
                    </button>
                  </div>
                ))
              )}
            </div>

            <p className="text-[10px] text-white/40 text-center pt-2">
              All calls are encrypted end-to-end with VoLTE 5G
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
