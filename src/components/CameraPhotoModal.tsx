import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Camera,
  Video,
  RefreshCw,
  Sparkles,
  Download,
  Send,
  Timer,
  Sliders,
  Check,
  Heart,
  Flame,
  Crown,
  Play,
  Square,
  Circle,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CameraPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendPhotoToPriya: (base64Jpeg: string) => void;
  isCallConnected: boolean;
  onStartCallIfIdle: () => void;
  initialMode?: 'photo' | 'video';
}

type PhotoFilter = 'normal' | 'cyberpunk' | 'bollywood' | 'vintage' | 'noir';
type StickerType = 'none' | 'favorite' | 'hero' | 'drama_king' | 'hot_mess';

export const CameraPhotoModal: React.FC<CameraPhotoModalProps> = ({
  isOpen,
  onClose,
  onSendPhotoToPriya,
  isCallConnected,
  onStartCallIfIdle,
  initialMode = 'photo',
}) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'video'>(initialMode);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [filter, setFilter] = useState<PhotoFilter>('cyberpunk');
  const [sticker, setSticker] = useState<StickerType>('favorite');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerDuration, setTimerDuration] = useState<number>(0); // 0 = instant, 3, 5
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSendingToPriya, setIsSendingToPriya] = useState<boolean>(false);

  // Video Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  // Start Camera Stream
  const startCamera = useCallback(async (mode: 'user' | 'environment') => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true, // Audio for video recording
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.warn('[Camera] Audio+Video error, falling back to video only:', err);
      try {
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        setStream(videoOnlyStream);
        if (videoRef.current) {
          videoRef.current.srcObject = videoOnlyStream;
        }
      } catch (e: any) {
        console.error('[Camera] Access error:', e);
        setCameraError('Camera access denied or unavailable. Please grant camera permission.');
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      setRecordedVideoUrl(null);
      setIsRecording(false);
      setRecordDuration(0);
      startCamera(facingMode);
    } else {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    };
  }, [isOpen]);

  // Flip camera between front & back
  const handleFlipCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Play shutter sound effect
  const playShutterSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // ignore
    }
  };

  // Capture instant photo from video stream
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    playShutterSound();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Flip horizontally if front-facing selfie
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform

    // Apply color tone overlay
    if (filter === 'cyberpunk') {
      ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (filter === 'bollywood') {
      ctx.fillStyle = 'rgba(255, 200, 100, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (filter === 'vintage') {
      ctx.fillStyle = 'rgba(160, 100, 50, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);

    // Confetti celebration
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f5d061', '#ffffff', '#ffd700'],
    });
  };

  // Handle Shutter click with timer countdown
  const handleShutterClick = () => {
    if (timerDuration === 0) {
      takeSnapshot();
      return;
    }

    setCountdown(timerDuration);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start Video Recording
  const handleStartRecording = () => {
    if (!stream) return;
    recordedChunksRef.current = [];
    setRecordedVideoUrl(null);
    setRecordDuration(0);

    try {
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsRecording(false);
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);

        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f5d061', '#ff4d4d', '#ffffff'],
        });
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      recordTimerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('[VideoRecorder] Failed to start:', err);
    }
  };

  // Stop Video Recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  // Send photo / video frame to Priya for live voice reaction
  const handleSendToPriya = () => {
    let base64Jpeg = '';
    if (capturedPhoto) {
      base64Jpeg = capturedPhoto.split(',')[1];
    } else if (canvasRef.current) {
      takeSnapshot();
      return;
    }

    if (!base64Jpeg) return;
    setIsSendingToPriya(true);
    onSendPhotoToPriya(base64Jpeg);

    if (!isCallConnected) {
      onStartCallIfIdle();
    }

    setTimeout(() => {
      setIsSendingToPriya(false);
      onClose();
    }, 1200);
  };

  // Download photo to device
  const handleDownloadPhoto = () => {
    if (!capturedPhoto) return;
    const a = document.createElement('a');
    a.href = capturedPhoto;
    a.download = `priya-selfie-${Date.now()}.jpg`;
    a.click();
  };

  // Download recorded video to device
  const handleDownloadVideo = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `priya-jarvis-video-${Date.now()}.webm`;
    a.click();
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none font-['Plus_Jakarta_Sans']">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-amber-400/40 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Flash animation */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-200 pointer-events-none" />
        )}

        {/* Header with Mode Switcher (Photo / Video) */}
        <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              {activeTab === 'photo' ? <Camera className="w-5 h-5" /> : <Video className="w-5 h-5 text-amber-300" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white font-['Outfit'] flex items-center gap-1.5">
                <span>Priya Media Studio</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold uppercase tracking-wider">
                  JARVIS HD ⚡
                </span>
              </h2>
              <p className="text-[11px] text-white/50">Snap photo or record high-definition video</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-white/10 text-xs">
              <button
                onClick={() => {
                  setActiveTab('photo');
                  setRecordedVideoUrl(null);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeTab === 'photo'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Photo 📸
              </button>
              <button
                onClick={() => {
                  setActiveTab('video');
                  setCapturedPhoto(null);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeTab === 'video'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Video 🎥
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport: Live Camera Feed or Captured Result */}
        <div className="relative flex-1 bg-black aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs text-red-300 font-medium">{cameraError}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Retry Camera
              </button>
            </div>
          ) : activeTab === 'video' && recordedVideoUrl ? (
            /* Recorded Video Playback View */
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
              <video
                src={recordedVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                ✓ Video Recorded Ready
              </div>
            </div>
          ) : capturedPhoto ? (
            /* Captured Photo Preview */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedPhoto}
                alt="Captured Priya Selfie"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
                ✓ Photo Captured
              </div>
            </div>
          ) : (
            /* Live Camera Feed */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? '-scale-x-100' : ''
                }`}
              />

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30 pointer-events-none">
                  <span className="text-7xl font-extrabold text-amber-400 animate-ping font-['Outfit']">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Recording Timer Overlay */}
              {isRecording && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono font-bold shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span>REC {formatSeconds(recordDuration)}</span>
                </div>
              )}

              {/* Camera Flip Button in Viewport */}
              <button
                onClick={handleFlipCamera}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white transition-transform active:scale-90"
                title="Flip Camera (Front/Back)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Hidden Canvas for snapshot processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-900/80 flex flex-col gap-3">
          {/* Actions for Captured Photo / Video */}
          {capturedPhoto ? (
            <div className="flex items-center justify-between gap-2.5">
              <button
                onClick={() => setCapturedPhoto(null)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPhoto}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Download Photo"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>

                <button
                  onClick={handleSendToPriya}
                  disabled={isSendingToPriya}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingToPriya ? 'Sending...' : 'Priya ko Dikhao 💖'}</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'video' && recordedVideoUrl ? (
            <div className="flex items-center justify-between gap-2.5">
              <button
                onClick={() => {
                  setRecordedVideoUrl(null);
                  setRecordDuration(0);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-record</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadVideo}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Download Video File"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Save Video</span>
                </button>

                <button
                  onClick={handleSendToPriya}
                  disabled={isSendingToPriya}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingToPriya ? 'Sending...' : 'Priya ko Send Karein 🎥'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Trigger Controls */
            <div className="flex flex-col items-center gap-3">
              {activeTab === 'photo' ? (
                /* Photo Shutter Button */
                <div className="flex items-center justify-center gap-6 w-full">
                  {/* Timer Selector */}
                  <button
                    onClick={() => setTimerDuration((prev) => (prev === 0 ? 3 : prev === 3 ? 5 : 0))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                      timerDuration > 0
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-white/50'
                    }`}
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>{timerDuration === 0 ? 'Off' : `${timerDuration}s`}</span>
                  </button>

                  {/* Main Shutter */}
                  <button
                    onClick={handleShutterClick}
                    className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                    title="Take Photo"
                  >
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-2 border-slate-900">
                      <Camera className="w-6 h-6 text-slate-900" />
                    </div>
                  </button>

                  {/* Filter cycler */}
                  <button
                    onClick={() => {
                      const filters: PhotoFilter[] = ['normal', 'cyberpunk', 'bollywood', 'vintage'];
                      const nextIdx = (filters.indexOf(filter) + 1) % filters.length;
                      setFilter(filters[nextIdx]);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/80 text-xs font-bold"
                  >
                    {filter.toUpperCase()}
                  </button>
                </div>
              ) : (
                /* Video Recording Button */
                <div className="flex items-center justify-center gap-6 w-full">
                  {!isRecording ? (
                    <button
                      onClick={handleStartRecording}
                      className="group flex items-center gap-2.5 px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/80 active:scale-95 transition-all cursor-pointer"
                    >
                      <Circle className="w-4 h-4 fill-white text-white animate-pulse" />
                      <span>Start Video Record</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopRecording}
                      className="group flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs shadow-xl active:scale-95 transition-all cursor-pointer animate-bounce"
                    >
                      <Square className="w-4 h-4 fill-red-600 text-red-600" />
                      <span>Stop & Preview ({formatSeconds(recordDuration)})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
