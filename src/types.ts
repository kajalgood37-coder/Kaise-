export type AssistantState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

export type AmbientMood = 
  | 'golden-white'
  | 'neon-cyberpunk' 
  | 'romantic-rose' 
  | 'aurora-violet' 
  | 'sunset-gold' 
  | 'midnight-pulse';

export interface MoodConfig {
  id: AmbientMood;
  name: string;
  tagline: string;
  primaryGlow: string;
  secondaryGlow: string;
  accentColor: string;
  bgGradient: string;
  haloColor: string;
}

export const MOOD_PRESETS: Record<AmbientMood, MoodConfig> = {
  'golden-white': {
    id: 'golden-white',
    name: 'Royal Golden White (Jarvis)',
    tagline: 'Imperial 24K Gold, Champagne & Pearl White Glow',
    primaryGlow: 'rgba(255, 215, 0, 0.6)',
    secondaryGlow: 'rgba(255, 255, 255, 0.75)',
    accentColor: '#f5d061',
    bgGradient: 'radial-gradient(ellipse at 50% 25%, #241c0a 0%, #141006 55%, #080602 100%)',
    haloColor: '#ffffff',
  },
  'neon-cyberpunk': {
    id: 'neon-cyberpunk',
    name: 'Cyberpunk Neon',
    tagline: 'Electric Cyan & Sassy Magenta',
    primaryGlow: 'rgba(0, 240, 255, 0.45)',
    secondaryGlow: 'rgba(255, 0, 127, 0.45)',
    accentColor: '#00f0ff',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, #0d1326 0%, #060814 60%, #020308 100%)',
    haloColor: '#ff007f',
  },
  'romantic-rose': {
    id: 'romantic-rose',
    name: 'Romantic Rose',
    tagline: 'Velvet Pink, Tease & Charm',
    primaryGlow: 'rgba(255, 42, 133, 0.5)',
    secondaryGlow: 'rgba(255, 117, 140, 0.45)',
    accentColor: '#ff2a85',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, #200a16 0%, #0f040b 60%, #050104 100%)',
    haloColor: '#ff758c',
  },
  'aurora-violet': {
    id: 'aurora-violet',
    name: 'Aurora Violet',
    tagline: 'Mystic Purple & Seductive Indigo',
    primaryGlow: 'rgba(157, 78, 221, 0.5)',
    secondaryGlow: 'rgba(6, 214, 160, 0.4)',
    accentColor: '#9d4edd',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, #150928 0%, #0a0418 60%, #03010a 100%)',
    haloColor: '#7b2cbf',
  },
  'sunset-gold': {
    id: 'sunset-gold',
    name: 'Sunset Gold',
    tagline: 'Warm Amber & Playful Sparks',
    primaryGlow: 'rgba(255, 153, 102, 0.5)',
    secondaryGlow: 'rgba(255, 94, 98, 0.45)',
    accentColor: '#ff9966',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, #241108 0%, #120803 60%, #050201 100%)',
    haloColor: '#ff5e62',
  },
  'midnight-pulse': {
    id: 'midnight-pulse',
    name: 'Midnight Pulse',
    tagline: 'Deep Sapphire & Neon Glow',
    primaryGlow: 'rgba(56, 189, 248, 0.45)',
    secondaryGlow: 'rgba(37, 99, 235, 0.4)',
    accentColor: '#38bdf8',
    bgGradient: 'radial-gradient(ellipse at 50% 30%, #08152c 0%, #040a17 60%, #01040a 100%)',
    haloColor: '#2563eb',
  },
};

export interface ToolActionItem {
  id: string;
  name: string;
  args: Record<string, any>;
  result: Record<string, any>;
  timestamp: number;
}

export type MusicCategory = 'Bollywood Romantic' | 'Punjabi Beats' | 'Lo-Fi Chill' | 'Retro Classics' | 'Custom';

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  category: MusicCategory;
  vibe: string;
  isPinned: boolean;
  youtubeUrl?: string;
}

export interface CallLogItem {
  id: string;
  name: string;
  phone?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: number;
  duration?: number;
  note?: string;
}

export type AvatarLookStyle = 'royal-gold' | 'desi-glam' | 'cyber-jarvis' | 'bollywood-chic';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'priya';
  text: string;
  timestamp: number;
}

export type VoiceName = 'Aoede' | 'Kore' | 'Puck' | 'Charon' | 'Fenrir';
export type VoiceGender = 'female' | 'male';

export interface VoiceOption {
  id: VoiceName;
  name: string;
  displayName: string;
  hindiName: string;
  gender: VoiceGender;
  vibe: string;
  tone: string;
  description: string;
  pitch: number;
}

export const AVAILABLE_VOICES: VoiceOption[] = [
  // Ladki Ki Awaazein (Female)
  {
    id: 'Aoede',
    name: 'Priya (Sassy Girl)',
    displayName: 'Priya (Sassy Girl)',
    hindiName: 'प्रिया (मस्त लड़की)',
    gender: 'female',
    vibe: 'Sassy, flirty & vibrant Bollywood girl tone',
    tone: 'Sassy, flirty & vibrant Bollywood girl tone',
    description: 'Charming, stylish girl voice with expressive Hinglish banter 👑',
    pitch: 1.2,
  },
  {
    id: 'Kore',
    name: 'Ananya (Sweet Girl)',
    displayName: 'Ananya (Sweet Girl)',
    hindiName: 'अनन्या (मीठी लड़की)',
    gender: 'female',
    vibe: 'Poised, caring, polite & soothing girl tone',
    tone: 'Poised, caring, polite & soothing girl tone',
    description: 'Calm, gentle and elegant girl voice for sweet conversations 🌸',
    pitch: 1.1,
  },
  // Ladke Ki Awaazein (Male)
  {
    id: 'Puck',
    name: 'Kabir (Smart Boy)',
    displayName: 'Kabir (Smart Boy)',
    hindiName: 'कबीर (स्मार्ट लड़का)',
    gender: 'male',
    vibe: 'Energetic, handsome, youthful & witty boy tone',
    tone: 'Energetic, handsome, youthful & witty boy tone',
    description: 'Lively, energetic young male voice with confident swag & charm ⚡',
    pitch: 0.95,
  },
  {
    id: 'Charon',
    name: 'Samir (Deep Male)',
    displayName: 'Samir (Deep Male)',
    hindiName: 'समीर (गहरी आवाज वाला लड़का)',
    gender: 'male',
    vibe: 'Deep, resonant, baritone & stylish gentleman tone',
    tone: 'Deep, resonant, baritone & stylish gentleman tone',
    description: 'Authoritative, deep and mature male voice with rich presence 🎙️',
    pitch: 0.85,
  },
  {
    id: 'Fenrir',
    name: 'Rohan (Friendly Bro)',
    displayName: 'Rohan (Friendly Bro)',
    hindiName: 'रोहन (दोस्ताना लड़का)',
    gender: 'male',
    vibe: 'Charming, friendly, modern casual buddy tone',
    tone: 'Charming, friendly, modern casual buddy tone',
    description: 'Warm, relaxed conversational male voice for daily chat & gaming 🎮',
    pitch: 0.9,
  },
];

export interface AppSettings {
  voice: VoiceName;
  attitudeLevel: 'spicy' | 'playful' | 'sweet';
  languageMode: 'hinglish' | 'english' | 'hindi';
  hapticFeedback: boolean;
  autoLaunchLinks: boolean;
  highQualityVisualizer: boolean;
  isUltraProMax: boolean;
  autoAnswerCalls: boolean;
  realisticRingtone: boolean;
  autoCallEnabled: boolean;
  autoCallIntervalSeconds: number;
  loudSpeakerBoost: boolean;
  gamingCompanionEnabled: boolean;
  jarvisMode: boolean;
  avatarLook: AvatarLookStyle;
  isOffline: boolean;
  autoSpeakChat: boolean;
}



