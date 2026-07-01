"use client";
// components/MetricsPanel.tsx — Quality metrics display with interpretations

import { motion } from "framer-motion";
import type { Metrics } from "@/types";

interface MetricsPanelProps {
  metrics: Metrics;
  interpretations?: {
    mse: string;
    psnr: string;
    ssim: string;
    mae: string;
  };
}

interface MetricConfig {
  key: keyof Metrics;
  label: string;
  unit: string;
  description: string;
  format: (v: number) => string;
  quality: (v: number) => "good" | "ok" | "poor";
}

const METRIC_CONFIGS: MetricConfig[] = [
  {
    key: "psnr",
    label: "PSNR",
    unit: "dB",
    description: "Peak Signal-to-Noise Ratio",
    format: (v) => v.toFixed(1),
    quality: (v) => v > 30 ? "good" : v > 25 ? "ok" : "poor",
  },
  {
    key: "ssim",
    label: "SSIM",
    unit: "",
    description: "Structural Similarity Index",
    format: (v) => v.toFixed(4),
    quality: (v) => v > 0.9 ? "good" : v > 0.8 ? "ok" : "poor",
  },
  {
    key: "mse",
    label: "MSE",
    unit: "",
    description: "Mean Squared Error",
    format: (v) => v.toFixed(1),
    quality: (v) => v < 50 ? "good" : v < 200 ? "ok" : "poor",
  },
  {
    key: "mae",
    label: "MAE",
    unit: "",
    description: "Mean Absolute Error",
    format: (v) => v.toFixed(1),
    quality: (v) => v < 10 ? "good" : v < 30 ? "ok" : "poor",
  },
];

const QUALITY_COLORS = {
  good: { text: "text-[var(--success)]", bg: "bg-[var(--success-bg)]", border: "border-green-500/20" },
  ok: { text: "text-[var(--warning)]", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  poor: { text: "text-[var(--error)]", bg: "bg-rose-500/10", border: "border-rose-500/20" },
};

export default function MetricsPanel({ metrics, interpretations }: MetricsPanelProps) {
  return (
    <div className="card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
        <ChartIcon />
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
          Quality Assessment
        </span>
        <span className="ml-auto text-[10px] text-[var(--text-muted)] font-mono">vs. Ground Truth</span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {METRIC_CONFIGS.map((cfg, idx) => {
          const value = metrics[cfg.key];
          const quality = cfg.quality(value);
          const colors = QUALITY_COLORS[quality];
          const interp = interpretations?.[cfg.key];

          return (
            <motion.div
              key={cfg.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              className={`metric-card ${colors.border}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest">
                    {cfg.label}
                  </span>
                  <div className={`text-2xl font-bold font-mono ${colors.text}`}>
                    {cfg.format(value)}
                    {cfg.unit && <span className="text-sm ml-1 font-normal opacity-70">{cfg.unit}</span>}
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${colors.text} ${colors.bg} border ${colors.border}`}>
                  {quality === "good" ? "GOOD" : quality === "ok" ? "OK" : "LOW"}
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">{cfg.description}</p>
              {interp && (
                <p className={`text-[10px] mt-1 font-medium ${colors.text}`}>{interp}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
