"use client";
// app/results/[jobId]/page.tsx — Results Dashboard

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ResultGallery from "@/components/ResultGallery";
import AnimationPlayer from "@/components/AnimationPlayer";
import MetricsPanel from "@/components/MetricsPanel";
import ComparisonSlider from "@/components/ComparisonSlider";
import SystemLogs from "@/components/SystemLogs";
import type { GenerateResponse, Metrics, Timestamps } from "@/types";

interface ResultData {
  jobId: string;
  outputPath: string;
  animationPath?: string;
  metrics?: Metrics;
  jobConfig?: {
    frameAPath: string;
    frameBPath: string;
    groundTruthPath?: string;
    timestamps: Timestamps;
    imageType: string;
    resolution: number;
  };
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [data, setData] = useState<ResultData | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [promptVisible, setPromptVisible] = useState(false);

  useEffect(() => {
    // Load result data from sessionStorage
    const resultStr = sessionStorage.getItem(`result_${jobId}`);
    if (resultStr) {
      const parsed: ResultData = JSON.parse(resultStr);
      setData(parsed);
    }

    // Fetch logs
    fetch(`/api/logs?jobId=${jobId}`)
      .then((r) => r.json())
      .then((d) => { if (d.logs) setLogs(d.logs); })
      .catch(() => {});
  }, [jobId]);

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <p className="text-[var(--text-secondary)]">Loading results...</p>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-2">{jobId}</p>
          </div>
        </div>
      </div>
    );
  }

  const frameAUrl = data.jobConfig?.frameAPath ?? "";
  const frameBUrl = data.jobConfig?.frameBPath ?? "";
  const midpointUrl = data.outputPath;
  const timestamps = data.jobConfig?.timestamps;
  const groundTruthUrl = data.jobConfig?.groundTruthPath;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="frame-badge text-[var(--success)] border-green-500/30 bg-green-500/10">
                Generation Complete
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">Interpolation Results</h1>
            <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{jobId}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <a
              href={midpointUrl}
              download={`${jobId}_midpoint.png`}
              className="download-btn"
              id="download-midpoint"
            >
              <DownloadIcon />
              Midpoint PNG
            </a>
            {data.animationPath && (
              <a
                href={data.animationPath}
                download={`${jobId}_animation.gif`}
                className="download-btn"
                id="download-gif"
              >
                <DownloadIcon />
                Animation GIF
              </a>
            )}
            <button
              onClick={() => router.push("/upload")}
              className="btn-secondary text-sm"
              id="new-job-btn"
            >
              + New Job
            </button>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* ── Row 1: Frame gallery ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ResultGallery
              frameA={frameAUrl}
              midpoint={midpointUrl}
              frameB={frameBUrl}
              timestamps={timestamps}
              jobId={jobId}
            />
          </motion.div>

          {/* ── Row 2: Animation + Metrics ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            <AnimationPlayer
              frameA={frameAUrl}
              midpoint={midpointUrl}
              frameB={frameBUrl}
              gifSrc={data.animationPath}
              timestamps={timestamps}
            />

            {data.metrics ? (
              <MetricsPanel metrics={data.metrics} />
            ) : (
              <div className="card flex flex-col items-center justify-center p-8 text-center gap-3">
                <div className="text-4xl opacity-30">📊</div>
                <p className="text-sm text-[var(--text-muted)]">
                  Quality metrics unavailable
                </p>
                <p className="text-xs text-[var(--text-muted)] max-w-[200px]">
                  Upload a ground truth frame on the upload page to enable MSE, PSNR, SSIM, and MAE metrics.
                </p>
              </div>
            )}
          </motion.div>

          {/* ── Row 3: Comparison slider (if ground truth) ────────────────── */}
          {groundTruthUrl && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ComparisonSlider
                beforeSrc={groundTruthUrl}
                afterSrc={midpointUrl}
                beforeLabel="Ground Truth"
                afterLabel="Generated"
              />
            </motion.div>
          )}

          {/* ── Row 4: Metadata + Logs ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Job metadata */}
            <div className="card p-5">
              <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <InfoIcon />
                Job Summary
              </h2>
              <div className="space-y-2.5 font-mono text-xs">
                {[
                  { k: "Job ID", v: jobId },
                  { k: "Model", v: "gemini-2.5-flash-image" },
                  { k: "T0", v: timestamps?.t0 ?? "—" },
                  { k: "Tmid", v: timestamps?.tmid ?? "—" },
                  { k: "T1", v: timestamps?.t1 ?? "—" },
                  { k: "Image Type", v: data.jobConfig?.imageType ?? "auto" },
                  { k: "Resolution", v: `${data.jobConfig?.resolution ?? 1024}px` },
                  { k: "Output", v: midpointUrl },
                ].map(({ k, v }) => (
                  <div key={k} className="flex gap-3">
                    <span className="text-[var(--text-muted)] w-24 flex-shrink-0">{k}</span>
                    <span className="text-[var(--text-secondary)] truncate">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System logs collapsible */}
            <div className="card p-5">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="w-full flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2"
                id="toggle-logs"
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  System Logs
                </span>
                <span className="text-[var(--text-muted)] normal-case tracking-normal font-normal">
                  {showLogs ? "▲ Collapse" : "▼ Expand"}
                </span>
              </button>
              {showLogs && <SystemLogs logs={logs} maxHeight="220px" />}
              {!showLogs && (
                <p className="text-xs text-[var(--text-muted)]">
                  Click to view {logs.length} log entries from this job.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-5 px-6 mt-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
          <span>FRAMES · Satellite Frame Interpolation · Phase 1 Prototype</span>
          <span>Powered by Gemini Nano Banana — gemini-2.5-flash-image</span>
        </div>
      </footer>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
