// Sci-Fi Space Game Web Audio API Sound Synthesizer

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  public ambientPlaying: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Futuristic high-tech UI beep
  playClick() {
    if (!this.enabled) return;
    try {
      this.initContext();
      const ctx = this.ctx;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  // Heavy mechanical component lock sound ("CLUNK - MOUNTED")
  playComponentMount() {
    if (!this.enabled) return;
    try {
      this.initContext();
      const ctx = this.ctx;
      if (!ctx) return;

      const now = ctx.currentTime;

      // Low mechanical thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);

      // High lock click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(1800, now + 0.04);
      clickOsc.frequency.exponentialRampToValueAtTime(900, now + 0.09);

      clickGain.gain.setValueAtTime(0.08, now + 0.04);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now + 0.04);
      clickOsc.stop(now + 0.1);
    } catch {}
  }

  // Quindar telemetry beep (authentic NASA Apollo/Shuttle ground tone)
  playQuindarBeep(type: 'intro' | 'outro' = 'intro') {
    if (!this.enabled) return;
    try {
      this.initContext();
      const ctx = this.ctx;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'intro' ? 2525 : 2475, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Powerful rocket booster rumble
  playThruster(durationSec = 2.0) {
    if (!this.enabled) return;
    try {
      this.initContext();
      const ctx = this.ctx;
      if (!ctx) return;

      const bufferSize = ctx.sampleRate * durationSec;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.06;
        b1 = 0.95 * b1 + white * 0.06;
        b2 = 0.85 * b2 + white * 0.12;
        data[i] = (b0 + b1 + b2) * 0.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const gain = ctx.createGain();
      const now = ctx.currentTime;

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + durationSec);
    } catch {}
  }

  // Emergency klaxon siren
  playAlarm() {
    if (!this.enabled) return;
    try {
      this.initContext();
      const ctx = this.ctx;
      if (!ctx) return;

      const now = ctx.currentTime;
      for (let i = 0; i < 2; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + (i * 0.24);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, startTime);
        osc.frequency.linearRampToValueAtTime(450, startTime + 0.2);

        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.22);
      }
    } catch {}
  }

  // Mission Achievement Fanfare
  playSuccess() {
    if (!this.enabled) return;
    try {
      this.initContext();
      const ctx = this.ctx;
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + (idx * 0.12);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + (idx === 4 ? 1.0 : 0.35));

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + (idx === 4 ? 1.1 : 0.4));
      });
    } catch {}
  }

  // Ambient Deep Space Drone (Atmospheric Sci-Fi Hum)
  toggleAmbientDrone(): boolean {
    if (!this.enabled) return false;
    try {
      this.initContext();
      const ctx = this.ctx;
      if (!ctx) return false;

      if (this.ambientPlaying && this.ambientOsc && this.ambientGain) {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.0);
        setTimeout(() => {
          this.ambientOsc?.stop();
          this.ambientOsc?.disconnect();
          this.ambientOsc = null;
        }, 1100);
        this.ambientPlaying = false;
        return false;
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(110, ctx.currentTime);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 1.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        this.ambientOsc = osc;
        this.ambientGain = gain;
        this.ambientPlaying = true;
        return true;
      }
    } catch {
      return false;
    }
  }
}

export const soundFx = new SoundEffectsManager();
