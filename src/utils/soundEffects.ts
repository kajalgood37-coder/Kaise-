/**
 * Synthesized Audio Sound Effects using Web Audio API
 * Provides zero-latency, CORS-free, realistic phone rings, call pick-up, camera snaps, and reactions.
 */

let audioCtxInstance: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!audioCtxInstance || audioCtxInstance.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxInstance = new AudioCtx();
  }
  if (audioCtxInstance.state === 'suspended') {
    audioCtxInstance.resume();
  }
  return audioCtxInstance;
}

// Active ringing loop interval
let activeRingtoneInterval: any = null;
let activeOscillators: OscillatorNode[] = [];

export function stopRingtone() {
  if (activeRingtoneInterval) {
    clearInterval(activeRingtoneInterval);
    activeRingtoneInterval = null;
  }
  for (const osc of activeOscillators) {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // ignore
    }
  }
  activeOscillators = [];
}

/**
 * Play realistic smartphone incoming ringtone melody (loops until stopped)
 * Supports loud speaker volume boost ("Awaaz Bahar / Loud Speaker")
 */
export function playIncomingRingtone(isBoosted = true) {
  stopRingtone();
  const ctx = getAudioContext();

  const notes = [
    { freq: 659.25, time: 0.0, dur: 0.15 }, // E5
    { freq: 587.33, time: 0.18, dur: 0.15 }, // D5
    { freq: 739.99, time: 0.36, dur: 0.22 }, // F#5
    { freq: 880.0, time: 0.6, dur: 0.28 }, // A5
    { freq: 659.25, time: 0.95, dur: 0.2 }, // E5
    { freq: 587.33, time: 1.18, dur: 0.35 }, // D5
  ];

  const playPhrase = () => {
    const now = ctx.currentTime;
    const peakGain = isBoosted ? 0.45 : 0.22;
    for (const n of notes) {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, now + n.time);

        gain.gain.setValueAtTime(0, now + n.time);
        gain.gain.linearRampToValueAtTime(peakGain, now + n.time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur);
        activeOscillators.push(osc);
      } catch {
        // ignore
      }
    }

    // Heavy vibration pattern on mobile devices for loud attention
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([250, 120, 250, 120, 350]);
    }
  };

  playPhrase();
  activeRingtoneInterval = setInterval(playPhrase, 2200);
}

/**
 * Play Outgoing call ring (classic 440Hz + 480Hz dual frequency ring... ring...)
 */
export function playOutgoingRing() {
  stopRingtone();
  const ctx = getAudioContext();

  const playRingCycle = () => {
    const now = ctx.currentTime;
    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);
      osc1.type = 'sine';
      osc2.type = 'sine';

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.setValueAtTime(0.12, now + 1.2);
      gain.gain.linearRampToValueAtTime(0, now + 1.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.3);
      osc2.stop(now + 1.3);

      activeOscillators.push(osc1, osc2);
    } catch {
      // ignore
    }
  };

  playRingCycle();
  activeRingtoneInterval = setInterval(playRingCycle, 3000);
}

/**
 * Play Call Pick-Up / Connected Sound (cheerful modern connect chime)
 */
export function playCallPickupSound() {
  stopRingtone();
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const tones = [
    { freq: 523.25, time: 0 }, // C5
    { freq: 659.25, time: 0.1 }, // E5
    { freq: 783.99, time: 0.2 }, // G5
    { freq: 1046.5, time: 0.32 }, // C6
  ];

  for (const t of tones) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, now + t.time);

      gain.gain.setValueAtTime(0.18, now + t.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t.time + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t.time);
      osc.stop(now + t.time + 0.18);
    } catch {
      // ignore
    }
  }

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([40, 40, 60]);
  }
}

/**
 * Play Call Disconnect Sound (3 busy beeps)
 */
export function playCallEndSound() {
  stopRingtone();
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  for (let i = 0; i < 3; i++) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + i * 0.2;

      osc.frequency.setValueAtTime(425, startTime);
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    } catch {
      // ignore
    }
  }

  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([60, 50, 60]);
  }
}

/**
 * Play soundboard reactions
 */
export function playReactionSound(reaction: 'whistle' | 'blush' | 'sparkle' | 'kiss' | 'cheer') {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  try {
    if (reaction === 'sparkle' || reaction === 'blush') {
      [800, 1000, 1200, 1500, 1800].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.06;
        osc.frequency.setValueAtTime(freq, t);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
      });
    } else if (reaction === 'whistle') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (reaction === 'kiss') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch {
    // ignore
  }
}
