"use client";
// components/SystemLogs.tsx — Live updating log panel

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SystemLogsProps {
  logs: string[];
  maxHeight?: string;
  title?: string;
}

export default function SystemLogs({ logs, maxHeight = "240px", title = "System Logs" }: SystemLogsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
            {title}
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          {logs.length} lines
        </span>
      </div>

      {/* Log output */}
      <div
        ref={scrollRef}
        className="log-panel"
        style={{ maxHeight }}
      >
        {logs.length === 0 ? (
          <p className="text-[var(--text-muted)] text-xs italic">Waiting for pipeline to start...</p>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((line, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={`log-line text-[11px] ${idx === logs.length - 1 ? "text-[var(--accent-cyan)]" : ""}`}
              >
                <span className="text-[var(--text-muted)] select-none mr-2">›</span>
                {line}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {/* Blinking cursor at end */}
        {logs.length > 0 && (
          <span className="inline-block w-1.5 h-3 bg-[var(--accent-cyan)] opacity-80 animate-pulse ml-1" />
        )}
      </div>
    </div>
  );
}
