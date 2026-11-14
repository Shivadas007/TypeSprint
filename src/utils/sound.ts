class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.5;

  private ensureAudio(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playTone(freq: number, dur: number, type: OscillatorType = 'triangle', vol = 0.12, delay = 0) {
    if (!this.enabled) return;
    const ctx = this.ensureAudio();
    if (!ctx) return;

    try {
      const t0 = ctx.currentTime + (delay || 0);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.setValueAtTime(freq, t0);
      osc.type = type;

      const finalVol = vol * this.volume;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(finalVol, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch {
      // Audio error suppressed gracefully
    }
  }

  public correct() {
    // Mechanical crisp tactile click
    this.playTone(720, 0.045, 'triangle', 0.09);
  }

  public error() {
    // Subtle low thud error
    this.playTone(180, 0.12, 'sawtooth', 0.08);
  }

  public space() {
    // Thump space bar resonance
    this.playTone(340, 0.07, 'sine', 0.08);
  }

  public finish() {
    // Futuristic cosmic fanfare
    const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    freqs.forEach((f, i) => {
      this.playTone(f, 0.24, 'triangle', 0.12, i * 0.09);
    });
  }

  public unlockAchievement() {
    // Shimmering ascending chime
    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((f, i) => {
      this.playTone(f, 0.3, 'sine', 0.15, i * 0.07);
    });
  }
}

export const sound = new SoundEngine();
