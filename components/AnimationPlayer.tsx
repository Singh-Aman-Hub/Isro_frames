"use client";
// components/AnimationPlayer.tsx — CSS-based frame animation player with controls

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface AnimationPlayerProps {
  frameA: string;     // public URL
  midpoint: string;   // public URL
  frameB: string;     // public URL
  gifSrc?: string;    // optional GIF URL
  timestamps?: { t0: string; tmid: string; t1: string };
}

const FRAMES = [
  { key: "A", label: "Frame A" },
  { key: "mid", label: "Midpoint" },
  { key: "B", label: "Frame B" },
];

export default function AnimationPlayer({
  frameA,
  midpoint,
  frameB,
  gifSrc,
  timestamps,
}: AnimationPlayerProps) {
  const frames = [frameA, midpoint, frameB];
  const labels = [
    timestamps?.t0 ?? "T0",
    timestamps?.tmid ?? "T_mid",
    timestamps?.t1 ?? "T1",
  ];
  const frameLabels = ["Frame A", "Generated Midpoint", "Frame B"];

  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(1); // frames per second
  const [showGif, setShowGif] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play cycle
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame((f) => (f + 1) % frames.length);
      }, 1000 / fps);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, fps, frames.length]);

  return (
    <div className="card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? "bg-[var(--success)] animate-pulse" : "bg-[var(--text-muted)]"}`} />
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
            Animation Player
          </span>
        </div>
        {gifSrc && (
          <button
            onClick={() => setShowGif(!showGif)}
            className="text-[11px] text-[var(--accent-cyan)] hover:text-white transition-colors font-mono"
          >
            {showGif ? "Frame View" : "GIF View"}
          </button>
        )}
      </div>

      {/* Frame display */}
      <div className="relative bg-black/50 min-h-[240px] flex items-center justify-center overflow-hidden">
        {showGif && gifSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={gifSrc} alt="Animation GIF" className="max-h-[280px] object-contain" />
        ) : (
          <>
            {frames.map((src, idx) => (
              <motion.div
                key={idx}
                className="absolute inset-0 flex items-center justify-center"
                initial={false}
                animate={{ opacity: idx === currentFrame ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={frameLabels[idx]}
                  className="max-h-[280px] w-full object-contain"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                />
              </motion.div>
            ))}

            {/* Frame label overlay */}
            <div className="absolute bottom-3 left-3">
              <span className="frame-badge">
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
                {frameLabels[currentFrame]} · {labels[currentFrame]}
              </span>
            </div>
          </>
        )}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(56,189,248,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.02) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Frame scrubber */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-[var(--border)]">
        {frames.map((_, idx) => (
          <button
            key={idx}
            onClick={() => { setCurrentFrame(idx); setIsPlaying(false); }}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              idx === currentFrame
                ? "bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)]"
                : "bg-[var(--stage-pending)] hover:bg-[var(--border-bright)]"
            }`}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          {/* Prev */}
          <button
            id="anim-prev"
            onClick={() => { setCurrentFrame((f) => (f - 1 + frames.length) % frames.length); setIsPlaying(false); }}
            className="p-1.5 rounded-md hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
          >
            <PrevIcon />
          </button>

          {/* Play/Pause */}
          <button
            id="anim-play"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              isPlaying
                ? "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--border-bright)]"
                : "bg-white/10 text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
            {isPlaying ? "Pause" : "Play"}
          </button>

          {/* Next */}
          <button
            id="anim-next"
            onClick={() => { setCurrentFrame((f) => (f + 1) % frames.length); setIsPlaying(false); }}
            className="p-1.5 rounded-md hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
          >
            <NextIcon />
          </button>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-muted)] font-mono">Speed</span>
          {[0.5, 1, 2].map((speed) => (
            <button
              key={speed}
              onClick={() => setFps(speed)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                fps === speed
                  ? "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--border-bright)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
}
function PauseIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
}
function PrevIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>;
}
function NextIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>;
}
