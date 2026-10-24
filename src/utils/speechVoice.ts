import { VoiceName } from '../types';

let currentUtterance: SpeechSynthesisUtterance | null = null;

// Clean text for natural speech synthesis (remove excessive emojis & markdown)
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[*_#`~>]/g, '') // remove markdown
    .replace(/https?:\/\/\S+/g, 'link') // replace urls
    .replace(/[✨👑⚡🌸💖😉🔥🌹💋🎮🎛️📲📞🎙️]/g, '') // strip visual emojis
    .trim();
}

/**
 * Speaks text out loud using browser Web Speech API with pitch & rate tailored
 * to the selected male (ladka) or female (ladki) voice.
 */
export function speakText(
  text: string,
  voiceName: VoiceName = 'Aoede',
  volume: number = 1.0,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Stop any currently ongoing speech
  stopSpeaking();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return;

  const utterance = new SpeechSynthesisUtterance(cleaned);
  currentUtterance = utterance;

  utterance.volume = Math.max(0, Math.min(1, volume));

  // Determine gender and acoustic parameters based on VoiceName
  const isMaleVoice = voiceName === 'Puck' || voiceName === 'Charon' || voiceName === 'Fenrir';

  if (isMaleVoice) {
    if (voiceName === 'Charon') {
      utterance.pitch = 0.78; // Deep resonant male
      utterance.rate = 0.95;
    } else if (voiceName === 'Puck') {
      utterance.pitch = 0.92; // Energetic boy
      utterance.rate = 1.05;
    } else {
      utterance.pitch = 0.88; // Casual bro
      utterance.rate = 1.0;
    }
  } else {
    if (voiceName === 'Kore') {
      utterance.pitch = 1.15; // Sweet, calm girl
      utterance.rate = 0.95;
    } else {
      utterance.pitch = 1.25; // Sassy, lively Priya girl
      utterance.rate = 1.05;
    }
  }

  // Find best available system voice (Hindi / Indian English / English)
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    // Prefer Hindi or Indian English voice if available
    const hindiVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('IN'));
    const englishVoice = voices.find((v) => v.lang.startsWith('en'));

    if (isMaleVoice) {
      // Look for male voice
      const maleVoice = voices.find(
        (v) =>
          (v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('rishi') ||
            v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('george')) &&
          !v.name.toLowerCase().includes('female')
      );
      if (maleVoice) {
        utterance.voice = maleVoice;
      } else if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
    } else {
      // Look for female voice
      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('swara') ||
          v.name.toLowerCase().includes('priya') ||
          v.name.toLowerCase().includes('veena')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else if (hindiVoice) {
        utterance.voice = hindiVoice;
      } else if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }
  }

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[SpeechVoice] Speech synthesis error:', err);
  }
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  } catch {
    // ignore
  }
}

export function isCurrentlySpeaking(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}
