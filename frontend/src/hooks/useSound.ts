"use client";
import { useCallback, useRef, useState } from "react";

class SoundEngine {
  private ctx: AudioContext | null = null;
  enabled = true;

  private boot() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }
  }

  private note(
    freq: number,
    start: number,
    dur: number,
    vol = 0.22,
    type: OscillatorType = "sine"
  ) {
    if (!this.enabled || !this.ctx) return;
    const ctx  = this.ctx;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
    gain.gain.setValueAtTime(vol, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + dur + 0.02);
  }

  private drum(start: number) {
    if (!this.enabled || !this.ctx) return;
    const ctx    = this.ctx;
    const frames = Math.floor(ctx.sampleRate * 0.15);
    const buf    = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data   = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frames, 3) * 0.4;
    }
    const src  = ctx.createBufferSource();
    const gain = ctx.createGain();
    src.buffer = buf;
    gain.gain.setValueAtTime(1, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.15);
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(ctx.currentTime + start);
  }

  /** Rising arpeggio — player selected */
  select() {
    this.boot();
    this.note(523.25, 0, 0.15);
    this.note(659.25, 0.12, 0.15);
    this.note(783.99, 0.24, 0.3);
  }

  /** Falling tone — player deselected */
  deselect() {
    this.boot();
    this.note(659.25, 0, 0.12);
    this.note(440, 0.12, 0.22);
  }

  /** Buzz — squad limit of 23 reached */
  limit() {
    this.boot();
    this.note(220, 0, 0.1, 0.28, "square");
    this.note(200, 0.11, 0.1, 0.28, "square");
    this.note(180, 0.22, 0.18, 0.2, "square");
  }

  /** Fanfare — squad of 23 or starting 11 complete */
  goal() {
    this.boot();
    const seq: [number, number, number, number][] = [
      [523.25, 0, 0.14, 0.28],
      [659.25, 0.14, 0.14, 0.28],
      [783.99, 0.28, 0.14, 0.28],
      [1046.5, 0.42, 0.55, 0.32],
      [783.99, 0.42, 0.55, 0.18],
      [659.25, 0.42, 0.55, 0.12],
    ];
    seq.forEach(([f, s, d, v]) => this.note(f, s, d, v));
    this.drum(0);
    this.drum(0.42);
  }

  /** Soft click — player placed on the field */
  place() {
    this.boot();
    this.note(880, 0, 0.07, 0.18);
    this.note(1108, 0.07, 0.1, 0.14);
  }

  /** Victory chord — selection saved */
  victory() {
    this.boot();
    ([ [261.63, 0], [329.63, 0.05], [392, 0.1], [523.25, 0.15] ] as [number, number][])
      .forEach(([f, s]) => this.note(f, s, 0.9, 0.22));
  }
}

// Singleton — one instance shared across the whole app
const engine = typeof window !== "undefined" ? new SoundEngine() : null;

export function useSound() {
  const [muted, setMuted] = useState(false);
  const engRef = useRef(engine);

  const toggle = useCallback(() => {
    if (!engRef.current) return;
    engRef.current.enabled = !engRef.current.enabled;
    setMuted(!engRef.current.enabled);
  }, []);

  return {
    muted,
    toggle,
    select:   () => engRef.current?.select(),
    deselect: () => engRef.current?.deselect(),
    limit:    () => engRef.current?.limit(),
    goal:     () => engRef.current?.goal(),
    place:    () => engRef.current?.place(),
    victory:  () => engRef.current?.victory(),
  };
}
