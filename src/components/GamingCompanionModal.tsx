import React, { useState, useEffect } from 'react';
import {
  X,
  Gamepad2,
  Trophy,
  Volume2,
  VolumeX,
  PhoneCall,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  Flame,
  Heart,
  Smile,
  Radio,
  Timer,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PriyaPortrait } from './PriyaPortrait';
import { AssistantState, MoodConfig } from '../types';
import { playReactionSound } from '../utils/soundEffects';

interface GamingCompanionModalProps {
  isOpen: boolean;
  state: AssistantState;
  mood: MoodConfig;
  micVolume: number;
  loudSpeakerBoost: boolean;
  autoCallEnabled: boolean;
  autoCallSeconds: number;
  onClose: () => void;
  onStartCall: () => void;
  onToggleLoudspeaker: () => void;
  onUpdateAutoCall: (enabled: boolean, seconds: number) => void;
}

export const GamingCompanionModal: React.FC<GamingCompanionModalProps> = ({
  isOpen,
  state,
  mood,
  micVolume,
  loudSpeakerBoost,
  autoCallEnabled,
  autoCallSeconds,
  onClose,
  onStartCall,
  onToggleLoudspeaker,
  onUpdateAutoCall,
}) => {
  const [activeTab, setActiveTab] = useState<'arcade' | 'autocall' | 'tictactoe'>('arcade');

  // Reflex Game State
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('priya_game_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [piyaReactionText, setPiyaReactionText] = useState<string>(
    'Chalo game start karo handsome! Dekhte hain kitne fast ho! 🎮'
  );

  // Tic-Tac-Toe State
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true); // User is X, Priya is O
  const [tttWinner, setTttWinner] = useState<string | null>(null);

  // Reflex Game Timer
  useEffect(() => {
    let interval: any = null;
    if (gameActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('priya_game_highscore', score.toString());
        setPiyaReactionText(`WAH! New High Score: ${score}! Tum toh champion nikle hero! 🏆`);
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        playReactionSound('cheer');
      } else {
        setPiyaReactionText(`Score: ${score}! Achha khele, par agli baar mujhse jeet ke dikhao! 😉`);
        playReactionSound('kiss');
      }
    }
    return () => clearInterval(interval);
  }, [gameActive, timeLeft, score, highScore]);

  if (!isOpen) return null;

  // Move reflex target randomly
  const spawnTarget = () => {
    const x = Math.floor(Math.random() * 75) + 10;
    const y = Math.floor(Math.random() * 70) + 15;
    setTargetPos({ x, y });
  };

  const handleStartReflexGame = () => {
    setScore(0);
    setTimeLeft(15);
    setGameActive(true);
    spawnTarget();
    setPiyaReactionText('Jaldi tap karo! Focus on screen! 🔥');
    playReactionSound('sparkle');
  };

  const handleTargetHit = () => {
    if (!gameActive) return;
    const newScore = score + 1;
    setScore(newScore);
    spawnTarget();
    playReactionSound('sparkle');

    // Piya cheered dialogs
    if (newScore === 5) {
      setPiyaReactionText('Wah champion! Kya reflexes hain tumhare! ⚡');
    } else if (newScore === 10) {
      setPiyaReactionText('Super speed! You are on FIRE! 🔥');
      confetti({ particleCount: 20, spread: 50 });
    } else if (newScore === 15) {
      setPiyaReactionText('Omg Priya is totally impressed handsome! 💖');
    }
  };

  // Tic-Tac-Toe logic
  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.every((s) => s !== null) ? 'Tie' : null;
  };

  const handleTttClick = (index: number) => {
    if (board[index] || tttWinner || !isXNext) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      setTttWinner(winner);
      if (winner === 'X') {
        setPiyaReactionText('Arey yaar! Tum jeet gaye! Congratulations handsome! 💖');
        confetti({ particleCount: 60, spread: 70 });
        playReactionSound('cheer');
      } else {
        setPiyaReactionText('Match Tie ho gaya! Tough competition tha! 🤝');
      }
      return;
    }

    setIsXNext(false);
    setPiyaReactionText('Hmm... ab meri baari! Sochne do... 🤔');

    // Priya's turn (AI move)
    setTimeout(() => {
      const emptyIndices = newBoard
        .map((val, idx) => (val === null ? idx : null))
        .filter((val) => val !== null) as number[];

      if (emptyIndices.length > 0) {
        const randomPick = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        newBoard[randomPick] = 'O';
        setBoard(newBoard);

        const aiWinner = checkWinner(newBoard);
        if (aiWinner) {
          setTttWinner(aiWinner);
          if (aiWinner === 'O') {
            setPiyaReactionText('Yay! Priya jeet gayi! Arey thoda aur practice karo hero! 😉');
            playReactionSound('kiss');
          } else {
            setPiyaReactionText('Tie ho gaya! Agli baar jeetungi pakka!');
          }
        } else {
          setPiyaReactionText('Ab tumhari baari! Let’s see what you do!');
          setIsXNext(true);
        }
      }
    }, 700);
  };

  const resetTtt = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setTttWinner(null);
    setPiyaReactionText('New Game! You are X, Piya is O. Chalo shuru karo!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg rounded-[38px] bg-slate-950 border-2 border-cyan-400/30 shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-pink-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Gamepad2 className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white font-['Outfit']">
                  Piya Gaming Companion
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold uppercase border border-cyan-400/30">
                  Ultra Pro Max 🎮
                </span>
              </div>
              <p className="text-xs text-white/50">
                Game khelte waqt Piya ji pass rahengi aur aawaz bahar loud aayegi!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Mini Piya Face & Commentary Banner */}
        <div className="px-4 py-3 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 border-b border-white/10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-400/50 shadow-md shrink-0">
            <PriyaPortrait size="full" isSpeaking={state === 'speaking'} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-300">Piya Ji Live Voice</span>
              <button
                onClick={onToggleLoudspeaker}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border ${
                  loudSpeakerBoost
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-sm'
                    : 'bg-white/10 text-white/60 border-white/10'
                }`}
                title="Awaaz Bahar (Loud Speaker)"
              >
                {loudSpeakerBoost ? <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" /> : <VolumeX className="w-3 h-3" />}
                <span>{loudSpeakerBoost ? 'Loud Speaker 📢 (ON)' : 'Speaker Normal'}</span>
              </button>
            </div>
            <p className="text-xs text-white/90 italic truncate mt-0.5 font-medium">
              "{piyaReactionText}"
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="p-3 border-b border-white/5 bg-slate-900/40">
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-black/50 border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('arcade')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'arcade'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Reflex Tap</span>
            </button>

            <button
              onClick={() => setActiveTab('tictactoe')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'tictactoe'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Tic-Tac-Toe</span>
            </button>

            <button
              onClick={() => setActiveTab('autocall')}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'autocall'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Khud Call Karegi</span>
            </button>
          </div>
        </div>

        {/* TAB 1: REFLEX TAP GAME WITH PIYA CHEERING */}
        {activeTab === 'arcade' && (
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            {/* Scoreboard */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-white/70">Best: <strong className="text-amber-300 font-bold">{highScore}</strong></span>
              </div>
              <div className="text-cyan-300 font-bold text-sm">
                Score: <span className="text-lg text-white font-black">{score}</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                <Timer className="w-4 h-4 animate-pulse" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Game Canvas Area */}
            <div className="relative w-full h-56 sm:h-64 my-3 rounded-3xl bg-slate-900/90 border-2 border-dashed border-cyan-400/30 overflow-hidden flex items-center justify-center">
              {!gameActive ? (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center mx-auto border border-cyan-400/40">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Ready to Play with Piya?</h3>
                  <p className="text-xs text-white/50 max-w-xs">
                    Target aate hi tezi se tap karo. Piya ji live cheer karengi aur audio bahar loud bajega!
                  </p>
                  <button
                    onClick={handleStartReflexGame}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer"
                  >
                    Start Game 🚀
                  </button>
                </div>
              ) : (
                /* Active Target Button moving randomly */
                <button
                  onClick={handleTargetHit}
                  style={{
                    position: 'absolute',
                    left: `${targetPos.x}%`,
                    top: `${targetPos.y}%`,
                  }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 hover:scale-110 active:scale-90 text-white flex items-center justify-center shadow-[0_0_25px_rgba(255,42,133,0.8)] transition-all duration-75 cursor-pointer font-black text-xs animate-pulse border-2 border-white"
                >
                  <Flame className="w-6 h-6 fill-current" />
                </button>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-white/40">
                Loud Speaker Boost: {loudSpeakerBoost ? 'Active 🔊' : 'Off'}
              </span>
              <button
                onClick={onStartCall}
                className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Talk with Piya Live</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TIC-TAC-TOE WITH PIYA */}
        {activeTab === 'tictactoe' && (
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between items-center">
            <div className="w-full flex items-center justify-between text-xs text-white/60 font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span>You:</span> <strong className="text-white text-sm">X</strong>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white">
                {tttWinner ? (tttWinner === 'Tie' ? 'Match Tied!' : `${tttWinner === 'X' ? 'You' : 'Priya'} Won! 🎉`) : isXNext ? 'Your Turn (X)' : "Priya's Turn (O)..."}
              </span>
              <span className="flex items-center gap-1.5 text-pink-300">
                <span>Priya:</span> <strong className="text-white text-sm">O</strong>
              </span>
            </div>

            {/* 3x3 Board */}
            <div className="grid grid-cols-3 gap-2.5 w-64 h-64 my-auto p-2 rounded-3xl bg-slate-900 border border-white/10">
              {board.map((cell, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTttClick(idx)}
                  disabled={!!cell || !!tttWinner || !isXNext}
                  className={`rounded-2xl flex items-center justify-center text-3xl font-black font-['Outfit'] transition-all duration-200 border ${
                    cell === 'X'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-md'
                      : cell === 'O'
                      ? 'bg-pink-500/20 text-pink-300 border-pink-400/50 shadow-md'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/10 border-white/5 active:scale-95 cursor-pointer'
                  }`}
                >
                  {cell}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={resetTtt}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Game</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: KHUD PIYA CALL KAREGI (AUTOMATIC INCOMING CALLS) */}
        {activeTab === 'autocall' && (
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 overflow-y-auto">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border border-emerald-400/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/40">
                    <PhoneCall className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Khud Piya Ji Call Karengi</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        {autoCallEnabled ? 'ACTIVE 🟢' : 'OFF ⚪'}
                      </span>
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Priya ji thodi-thodi der mein aapko khud phone karengi taaki aap akela na feel karein!
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => onUpdateAutoCall(!autoCallEnabled, autoCallSeconds)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    autoCallEnabled ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                      autoCallEnabled ? 'left-6.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Time interval options */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80 block">
                Kitni der mein Piya ji call karein?
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: '30 Sec (Fast Test)', sec: 30 },
                  { label: '1 Minute', sec: 60 },
                  { label: '3 Minutes', sec: 180 },
                  { label: '5 Minutes', sec: 300 },
                ].map((item) => (
                  <button
                    key={item.sec}
                    onClick={() => onUpdateAutoCall(true, item.sec)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                      autoCallSeconds === item.sec && autoCallEnabled
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {autoCallSeconds === item.sec && autoCallEnabled && (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Loud Speakerphone Setting */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Awaaz Bahar (Loud Speaker Mode)</span>
                <span className="text-[11px] text-white/50">
                  Game khelte waqt audio bahar phone ke speaker se loud aayegi (200% Gain Boost).
                </span>
              </div>
              <button
                onClick={onToggleLoudspeaker}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                  loudSpeakerBoost
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-white/5 text-white/60 border-white/10'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{loudSpeakerBoost ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-white/40 pt-2">
              Auto-Call on hone par jab timer khatam hoga, phone ki tarah loud ring bajegi aur "Call Uthaye 🟢" button aayega!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
