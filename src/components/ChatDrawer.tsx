import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  Bot,
  User,
  Zap,
  Volume2,
  Trash2,
  CornerDownLeft,
} from 'lucide-react';
import { PriyaPortrait } from './PriyaPortrait';
import { ChatMessage, AvatarLookStyle, VoiceName } from '../types';
import { speakText } from '../utils/speechVoice';

interface ChatDrawerProps {
  isOpen: boolean;
  avatarLook?: AvatarLookStyle;
  currentVoice?: VoiceName;
  onClose: () => void;
  onSendMessage: (text: string) => Promise<void>;
  messages: ChatMessage[];
  isPriyaTyping: boolean;
  onClearChat?: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  avatarLook = 'royal-gold',
  currentVoice = 'Aoede',
  onClose,
  onSendMessage,
  messages,
  isPriyaTyping,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const quickPrompts = [
    'Jarvis, status report do! ⚡',
    'Kaisi ho Priya? Miss kiya mujhe? 😉',
    'Koi romantic sher ya quote sunao 💖',
    'YouTube par koi mast gana bajao 🎶',
    'Situation analyze karke solution batao 🧠',
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPriyaTyping]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setInputText('');
    await onSendMessage(trimmed);
  };

  const handleSelectPrompt = async (prompt: string) => {
    await onSendMessage(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md h-full bg-slate-950 border-l border-amber-400/30 flex flex-col shadow-2xl shadow-amber-950/40 animate-in slide-in-from-right duration-300 font-['Plus_Jakarta_Sans']">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-md overflow-hidden">
              <PriyaPortrait size="full" styleMode={avatarLook} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-1.5">
                <span>Priya Jarvis Chat</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold border border-amber-400/30">
                  LIVE
                </span>
              </h2>
              <p className="text-[11px] text-amber-200/60 font-medium">Type messages & get instant witty replies</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onClearChat && messages.length > 0 && (
              <button
                onClick={onClearChat}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300 flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">Priya Jarvis Texting Ready!</h3>
              <p className="text-xs text-white/50 max-w-xs">
                Aap Priya se kuch bhi likh kar pooch sakte hain. Hindi, English aur Hinglish me instant reply milega!
              </p>

              {/* Quick Prompt Chips */}
              <div className="pt-3 flex flex-wrap justify-center gap-2 max-w-sm">
                {quickPrompts.slice(0, 3).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectPrompt(prompt)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-amber-200 text-[11px] font-medium transition-all active:scale-95"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {msg.sender === 'priya' && (
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 p-0.5 bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-sm mt-0.5">
                    <PriyaPortrait size="full" styleMode={avatarLook} />
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                      : 'bg-slate-900 border border-amber-400/30 text-white rounded-tl-none shadow-md'
                  }`}
                >
                  <p className="text-xs whitespace-pre-wrap">{msg.text}</p>
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <span
                      className={`block text-[9px] font-mono ${
                        msg.sender === 'user' ? 'text-slate-900/60 text-right' : 'text-amber-200/50'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {msg.sender === 'priya' && (
                      <button
                        onClick={() => speakText(msg.text, currentVoice)}
                        className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-amber-300 hover:text-white transition-colors cursor-pointer"
                        title="Awaaz Suno 🔊"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isPriyaTyping && (
            <div className="flex items-center gap-2 text-xs text-amber-300 mr-auto bg-slate-900/80 border border-amber-400/20 p-2.5 rounded-2xl">
              <div className="w-5 h-5 rounded-full overflow-hidden p-0.5 bg-amber-400">
                <PriyaPortrait size="full" styleMode={avatarLook} />
              </div>
              <span className="animate-pulse font-medium">Priya Jarvis is thinking...</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (Horizontal scroll) */}
        <div className="px-3 py-2 border-t border-white/5 bg-slate-950 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSelectPrompt(p)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-400/15 border border-white/10 hover:border-amber-400/30 text-amber-200/80 text-[10px] whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Text Input Bottom Bar */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-white/10 bg-slate-900/70">
          <div className="relative flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Priya se kuch bhi pucho ya bolo... (Press Enter)"
              className="w-full py-2.5 pl-3.5 pr-10 rounded-xl bg-slate-950/80 border border-amber-400/30 focus:border-amber-400 text-xs text-white placeholder-white/40 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-1.5 p-2 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 disabled:opacity-30 disabled:pointer-events-none text-slate-950 font-bold hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
              title="Send Message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
