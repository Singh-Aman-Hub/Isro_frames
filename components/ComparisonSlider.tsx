"use client";
// components/ComparisonSlider.tsx — Before/after drag comparison slider

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

interface ComparisonSliderProps {
  beforeSrc: string;   // Ground truth or original frame B
  afterSrc: string;    // Generated frame
  beforeLabel?: string;
  afterLabel?: string;
}

export default function ComparisonSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Ground Truth",
  afterLabel = "Generated",
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => { if (isDragging) updatePosition(e.clientX); },
    [isDragging, updatePosition]
  );
  const onMouseUp = useCallback(() => setIsDragging(false), []);
  const onTouchMove = useCallback(
    (e: TouchEvent) => { if (isDragging && e.touches[0]) updatePosition(e.touches[0].clientX); },
    [isDragging, updatePosition]
  );

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onMouseUp);
    };
  }, [onMouseMove, onMouseUp, onTouchMove]);

  return (
    <div className="card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
          Frame Comparison
        </span>
        <span className="ml-auto text-[10px] text-[var(--text-muted)] font-mono">Drag slider →</span>
      </div>

      {/* Comparison area */}
      <div
        ref={containerRef}
        className="comparison-slider relative min-h-[280px] select-none"
        onMouseDown={(e) => { setIsDragging(true); updatePosition(e.clientX); }}
        onTouchStart={(e) => { setIsDragging(true); if (e.touches[0]) updatePosition(e.touches[0].clientX); }}
      >
        {/* Before (ground truth) — full width */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
          style={{ background: "rgba(0,0,0,0.5)" }}
        />

        {/* After (generated) — clipped by position */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterSrc}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-contain"
            draggable={false}
            style={{ background: "rgba(0,0,0,0.5)" }}
          />
        </div>

        {/* Slider handle */}
        <div
          className="comparison-handle"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          {/* Handle icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--bg-card)] border-2 border-[var(--accent-cyan)] shadow-[0_0_12px_var(--accent-cyan)] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
              <polyline points="9 18 15 12 9 6" transform="translate(0,0) scale(-1,1) translate(-24,0)" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 z-20">
          <span className="frame-badge text-indigo-300 border-indigo-400/30 bg-indigo-500/10">
            {beforeLabel}
          </span>
        </div>
        <div className="absolute top-3 right-3 z-20">
          <span className="frame-badge text-[var(--accent-cyan)]">
            {afterLabel}
          </span>
        </div>

        {/* Position indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
          <span className="text-[10px] text-[var(--text-muted)] font-mono bg-[var(--bg-base)]/80 px-2 py-0.5 rounded">
            {position.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
