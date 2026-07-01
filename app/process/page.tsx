"use client";
// app/process/page.tsx — 13-Stage DL Pipeline Monitor

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import ProgressSteps from "@/components/ProgressSteps";
import SystemLogs from "@/components/SystemLogs";
import type { PipelineStage, GenerateRequest, GenerateResponse, SSEEvent } from "@/types";
import { Suspense } from "react";

const STAGE_DEFINITIONS = [
  "Initializing job",
  "Validating uploaded frames",
  "Preprocessing images",
  "Analyzing spatial consistency",
  "Performing temporal alignment",
  "Estimating optical flow vectors",
  "Constructing interpolation prompt",
  "Dispatching to inference engine",
  "Generating midpoint frame",
  "Applying output normalization",
  "Building animation sequence",
  "Computing quality assessment",
  "Finalizing results",
];

function initStages(): PipelineStage[] {
  return STAGE_DEFINITIONS.map((label, idx) => ({
    id: idx + 1,
    label,
    status: "pending",
  }));
}

function ProcessPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [stages, setStages] = useState<PipelineStage[]>(initStages());
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Elapsed timer
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedSecs(Math.floor((Date.now() - (startTimeRef.current ?? Date.now())) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  useEffect(() => {
    if (!jobId) {
      setError("No job ID found. Please start from the upload page.");
      return;
    }

    // Read job config from sessionStorage
    const jobConfigStr = sessionStorage.getItem(`job_${jobId}`);
    if (!jobConfigStr) {
      setError("Job configuration not found. Please try again.");
      return;
    }

    const jobConfig: GenerateRequest = JSON.parse(jobConfigStr);
    startPipeline(jobConfig);
  }, [jobId]);

  async function startPipeline(jobConfig: GenerateRequest) {
    setIsRunning(true);
    setError(null);
    setLogs([`Starting pipeline for job ${jobConfig.jobId}...`]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobConfig),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event: SSEEvent = JSON.parse(jsonStr);
            handleSSEEvent(event);
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Pipeline failed";
      setError(message);
      setLogs((l) => [...l, `ERROR: ${message}`]);
    } finally {
      setIsRunning(false);
    }
  }

  function handleSSEEvent(event: SSEEvent) {
    switch (event.type) {
      case "stage":
        if (event.stageId != null && event.stageStatus) {
          setStages((prev) =>
            prev.map((s) =>
              s.id === event.stageId ? { ...s, status: event.stageStatus! } : s
            )
          );
        }
        break;

      case "log":
        if (event.message) {
          setLogs((prev) => [...prev, event.message!]);
        }
        break;

      case "complete":
        if (event.data) {
          setResult(event.data);
          setIsRunning(false);
          // Navigate to results after a brief delay
          if (event.data.jobId) {
            setTimeout(() => {
              const data = event.data!;
              sessionStorage.setItem(
                `result_${data.jobId}`,
                JSON.stringify({
                  ...data,
                  jobConfig: JSON.parse(sessionStorage.getItem(`job_${data.jobId}`) ?? "{}"),
                })
              );
              router.push(`/results/${data.jobId}`);
            }, 1500);
          }
        }
        break;

      case "error":
        setError(event.message ?? "Unknown pipeline error");
        setIsRunning(false);
        break;
    }
  }

  const doneCount = stages.filter((s) => s.status === "done").length;
  const progress = (doneCount / stages.length) * 100;
  const currentStage = stages.find((s) => s.status === "active");

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)]">
      {/* Top bar */}
      <div className="navbar h-14 flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-md bg-gradient-to-br from-cyan-400 to-blue-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <span className="text-sm font-bold text-gradient">FRAMES</span>
          <span className="text-[var(--text-muted)] text-xs">/ Pipeline Monitor</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
          <span>Job: <span className="text-[var(--accent-cyan)]">{jobId ?? "—"}</span></span>
          <span>Elapsed: <span className="text-[var(--text-secondary)]">{elapsedSecs}s</span></span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-[var(--border)] w-full">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* ── Left: Pipeline stages ──────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Pipeline Monitor</h1>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                  {doneCount}/{stages.length} stages complete
                </p>
              </div>
              {isRunning && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-[var(--border-bright)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
                  <span className="text-xs text-[var(--accent-cyan)] font-mono font-semibold">RUNNING</span>
                </div>
              )}
              {result && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--success-bg)] border border-green-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  <span className="text-xs text-[var(--success)] font-mono font-semibold">COMPLETE</span>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30">
                  <span className="text-xs text-rose-400 font-mono font-semibold">ERROR</span>
                </div>
              )}
            </div>

            <div className="card p-5">
              <ProgressSteps stages={stages} currentStage={currentStage?.id} />
            </div>
          </div>

          {/* ── Right: Logs + status ───────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {/* Current stage indicator */}
            {currentStage && (
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass p-4"
              >
                <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-widest mb-1">
                  Currently running
                </div>
                <div className="flex items-center gap-2">
                  <div className="spinner" />
                  <span className="text-sm font-semibold text-[var(--accent-cyan)]">
                    {currentStage.label}
                  </span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono mt-1">
                  Stage {currentStage.id} / 13
                </div>
              </motion.div>
            )}

            {/* System logs */}
            <div className="card p-5 flex-1">
              <SystemLogs logs={logs} maxHeight="360px" />
            </div>

            {/* ETA estimate */}
            <div className="card p-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase mb-0.5">
                  Elapsed
                </div>
                <div className="text-lg font-bold font-mono text-[var(--accent-cyan)]">
                  {elapsedSecs}s
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase mb-0.5">
                  Model
                </div>
                <div className="text-xs font-mono text-[var(--text-secondary)]">
                  gemini-2.5-flash
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase mb-0.5">
                  Progress
                </div>
                <div className="text-lg font-bold font-mono text-[var(--accent-cyan)]">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>

            {/* Error panel */}
            {error && (
              <div className="card p-4 border-rose-500/30">
                <div className="text-xs font-bold text-rose-400 mb-2">Pipeline Error</div>
                <p className="text-sm text-rose-300">{error}</p>
                <button
                  onClick={() => router.push("/upload")}
                  className="btn-secondary mt-3 text-xs"
                >
                  ← Back to Upload
                </button>
              </div>
            )}

            {/* Success / redirect notice */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-4 border-[var(--success)]/30 bg-[var(--success-bg)]"
              >
                <div className="text-xs font-bold text-[var(--success)] mb-2">
                  ✓ Generation Complete
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Redirecting to results page...
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProcessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">Loading...</div>}>
      <ProcessPageInner />
    </Suspense>
  );
}
