"use client";
// components/ResultGallery.tsx — 3-column frame display row

import { motion } from "framer-motion";
import FramePreview from "./FramePreview";

interface ResultGalleryProps {
  frameA: string;
  midpoint: string;
  frameB: string;
  timestamps?: { t0: string; tmid: string; t1: string };
  jobId: string;
}

export default function ResultGallery({
  frameA,
  midpoint,
  frameB,
  timestamps,
  jobId,
}: ResultGalleryProps) {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="glow-divider flex-1" />
        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest font-mono">
          Frame Sequence
        </span>
        <div className="glow-divider flex-1" />
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FramePreview
          src={frameA}
          label="Frame A"
          timestamp={timestamps?.t0}
          isGenerated={false}
          downloadFilename={`${jobId}_frameA.png`}
        />

        {/* Center: Generated with glow effect */}
        <div className="relative">
          {/* Glow behind generated frame */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-blue-600/10 blur-md pointer-events-none" />
          <FramePreview
            src={midpoint}
            label="Generated Midpoint"
            timestamp={timestamps?.tmid}
            isGenerated={true}
            downloadFilename={`${jobId}_midpoint.png`}
          />
        </div>

        <FramePreview
          src={frameB}
          label="Frame B"
          timestamp={timestamps?.t1}
          isGenerated={false}
          downloadFilename={`${jobId}_frameB.png`}
        />
      </div>

      {/* Timeline connector */}
      <div className="flex items-center gap-2 mt-4 px-8 opacity-50">
        <div className="w-2 h-2 rounded-full bg-indigo-400" />
        <div className="flex-1 h-px bg-gradient-to-r from-indigo-400 to-cyan-400" />
        <div className="w-3 h-3 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30" />
        <div className="flex-1 h-px bg-gradient-to-r from-cyan-400 to-indigo-400" />
        <div className="w-2 h-2 rounded-full bg-indigo-400" />
      </div>
      <div className="flex items-center justify-between px-6 mt-1 text-[10px] text-[var(--text-muted)] font-mono opacity-60">
        <span>{timestamps?.t0 ?? "T0"}</span>
        <span className="text-[var(--accent-cyan)]">{timestamps?.tmid ?? "T_mid"} ← synthesized</span>
        <span>{timestamps?.t1 ?? "T1"}</span>
      </div>
    </div>
  );
}
