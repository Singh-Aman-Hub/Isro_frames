"use client";
// components/ProgressSteps.tsx — 13-stage DL pipeline monitor with framer-motion

import { motion, AnimatePresence } from "framer-motion";
import type { PipelineStage, PipelineStageStatus } from "@/types";

interface ProgressStepsProps {
  stages: PipelineStage[];
  currentStage?: number;
}

export default function ProgressSteps({ stages, currentStage }: ProgressStepsProps) {
  return (
    <div className="flex flex-col gap-0">
      {stages.map((stage, idx) => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.04, duration: 0.25 }}
          className={`relative flex items-start gap-3 py-2 group stage-${stage.status}`}
        >
          {/* Connector line */}
          {idx < stages.length - 1 && (
            <div
              className="absolute left-[15px] top-[34px] bottom-0 w-px"
              style={{
                background: stage.status === "done"
                  ? "var(--success)"
                  : "var(--stage-pending)",
                opacity: 0.4,
                height: "24px",
              }}
            />
          )}

          {/* Stage dot */}
          <div className="stage-dot mt-0.5 z-10">
            {stage.status === "done" && <CheckIcon />}
            {stage.status === "active" && <div className="spinner" />}
            {stage.status === "pending" && (
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                {String(stage.id).padStart(2, "0")}
              </span>
            )}
            {stage.status === "error" && <ErrorIcon />}
          </div>

          {/* Stage label + status */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  stage.status === "done"
                    ? "text-[var(--success)]"
                    : stage.status === "active"
                    ? "text-[var(--accent-cyan)]"
                    : stage.status === "error"
                    ? "text-[var(--error)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {stage.label}
              </span>
              {stage.status === "active" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-1"
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1 h-1 rounded-full bg-[var(--accent-cyan)]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </motion.div>
              )}
              {stage.status === "done" && stage.duration !== undefined && (
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  {stage.duration < 1000
                    ? `${stage.duration}ms`
                    : `${(stage.duration / 1000).toFixed(1)}s`}
                </span>
              )}
            </div>

            {/* Stage ID badge */}
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              STAGE {String(stage.id).padStart(2, "0")} / 13
            </span>
          </div>

          {/* Status icon right side */}
          <div className="pt-1.5 flex-shrink-0">
            {stage.status === "done" && (
              <span className="text-[10px] text-[var(--success)] font-mono font-semibold">DONE</span>
            )}
            {stage.status === "active" && (
              <span className="text-[10px] text-[var(--accent-cyan)] font-mono font-semibold animate-pulse">
                RUNNING
              </span>
            )}
            {stage.status === "pending" && (
              <span className="text-[10px] text-[var(--text-muted)] font-mono">QUEUED</span>
            )}
            {stage.status === "error" && (
              <span className="text-[10px] text-[var(--error)] font-mono font-semibold">ERROR</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
