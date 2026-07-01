"use client";
// components/FramePreview.tsx — Labeled satellite frame display card

import { motion } from "framer-motion";

interface FramePreviewProps {
  src: string;
  label: string;        // "Frame A", "Generated Midpoint", "Frame B"
  timestamp?: string;   // "00:00 UTC", "00:10 UTC", "00:20 UTC"
  isGenerated?: boolean;
  downloadFilename?: string;
  width?: number;
  height?: number;
}

export default function FramePreview({
  src,
  label,
  timestamp,
  isGenerated = false,
  downloadFilename,
  width = 400,
  height = 400,
}: FramePreviewProps) {
  const badgeColor = isGenerated
    ? "from-cyan-500/20 to-blue-600/20 border-cyan-400/40 text-cyan-300"
    : "from-indigo-500/10 to-blue-500/10 border-indigo-400/30 text-indigo-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="card flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          {isGenerated && (
            <div className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
          )}
          <span className={`text-xs font-bold uppercase tracking-widest ${isGenerated ? "text-[var(--accent-cyan)]" : "text-[var(--text-secondary)]"}`}>
            {label}
          </span>
        </div>
        {timestamp && (
          <span className="frame-badge text-[var(--text-secondary)]">
            <span className="w-1 h-1 rounded-full bg-current opacity-60" />
            {timestamp}
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative bg-black/40 flex items-center justify-center" style={{ minHeight: "200px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          className="w-full object-contain max-h-[300px]"
          style={{ background: "rgba(0,0,0,0.6)" }}
        />

        {/* Generated indicator overlay */}
        {isGenerated && (
          <div className="absolute top-2 left-2">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-widest bg-gradient-to-r border ${badgeColor}`}>
              <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
              AI Generated
            </div>
          </div>
        )}

        {/* Grid overlay for scientific look */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--border)]">
        <span className="text-[10px] text-[var(--text-muted)] font-mono">PNG · {isGenerated ? "SYNTHESIZED" : "ORIGINAL"}</span>
        {downloadFilename && (
          <a
            href={src}
            download={downloadFilename}
            className="download-btn text-[11px] px-3 py-1"
          >
            <DownloadIcon size={12} />
            Download
          </a>
        )}
      </div>
    </motion.div>
  );
}

function DownloadIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
