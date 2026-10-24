/**
 * Audio processing utilities for Gemini Live API
 * Requirements:
 * - Mic Input: PCM16 16kHz Little-Endian
 * - Model Output: PCM16 24kHz Little-Endian
 */

// Downsample Float32Array buffer to 16,000 Hz if needed
export function downsampleBuffer(
  buffer: Float32Array,
  inputSampleRate: number,
  outputSampleRate = 16000
): Float32Array {
  if (inputSampleRate === outputSampleRate) {
    return buffer;
  }
  if (inputSampleRate < outputSampleRate) {
    // If lower, return as is or linearly interpolate up
    return buffer;
  }
  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    // Linear average accumulation across window
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : buffer[offsetBuffer] || 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

// Convert Float32Array (normalized audio [-1, 1]) to 16-bit PCM Base64 string
export function float32ToPcm16Base64(input: Float32Array): string {
  const pcm16 = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // Convert to binary string
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;

  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }

  return btoa(binary);
}

// Convert Base64 PCM16 Little-Endian to Float32Array for 24kHz playback
export function pcm16Base64ToFloat32(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const pcm16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(pcm16.length);

  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768.0;
  }

  return float32;
}

// Calculate Root Mean Square (RMS) volume level [0 - 1]
export function calculateRMS(buffer: Float32Array): number {
  if (buffer.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sum / buffer.length);
  return Math.min(1, rms * 4); // Boost slightly for visual sensitivity
}

/**
 * AudioQueuePlayer
 * Dedicated gapless 24kHz AudioBuffer scheduler for model voice output.
 * Supports immediate interruption, pause, and volume control.
 */
export class AudioQueuePlayer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isInterrupted = false;
  private onSpeakingChange?: (isSpeaking: boolean) => void;
  private checkSpeakingInterval: any = null;

  constructor(onSpeakingChange?: (isSpeaking: boolean) => void) {
    this.onSpeakingChange = onSpeakingChange;
  }

  public init() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      // Output sample rate is 24,000 Hz as per Gemini Live output format
      this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
      this.gainNode = this.audioCtx.createGain();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      this.nextStartTime = this.audioCtx.currentTime;

      // Monitor playback state
      if (this.checkSpeakingInterval) clearInterval(this.checkSpeakingInterval);
      this.checkSpeakingInterval = setInterval(() => {
        if (!this.audioCtx) return;
        const isSpeaking = this.activeSources.length > 0 && this.audioCtx.currentTime < this.nextStartTime;
        this.onSpeakingChange?.(isSpeaking);
      }, 50);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setVolume(volume: number, isBoosted = false) {
    if (this.gainNode) {
      const maxGain = isBoosted ? 2.2 : 1.0;
      this.gainNode.gain.value = Math.max(0, Math.min(maxGain, isBoosted ? volume * 1.8 : volume));
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public enqueueChunk(pcmBase64: string) {
    this.init();
    if (!this.audioCtx || !this.gainNode) return;

    this.isInterrupted = false;
    const float32Data = pcm16Base64ToFloat32(pcmBase64);
    if (float32Data.length === 0) return;

    // Create 24kHz AudioBuffer
    const audioBuffer = this.audioCtx.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.gainNode);

    // Schedule gapless playback
    const currentTime = this.audioCtx.currentTime;
    const startTime = Math.max(currentTime, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + audioBuffer.duration;

    this.activeSources.push(source);
    this.onSpeakingChange?.(true);

    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) {
        this.activeSources.splice(idx, 1);
      }
      if (this.activeSources.length === 0 && this.audioCtx) {
        if (this.audioCtx.currentTime >= this.nextStartTime) {
          this.onSpeakingChange?.(false);
        }
      }
    };
  }

  public interrupt() {
    this.isInterrupted = true;
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source might have already finished
      }
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
    this.onSpeakingChange?.(false);
  }

  public close() {
    if (this.checkSpeakingInterval) {
      clearInterval(this.checkSpeakingInterval);
      this.checkSpeakingInterval = null;
    }
    this.interrupt();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }
  }
}
