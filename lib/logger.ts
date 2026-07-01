// lib/logger.ts — Per-job structured logging

import fs from "fs";
import path from "path";

const logsDir = path.join(process.cwd(), "logs");

function ensureLogsDir() {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Logs a step message to both console and a per-job log file.
 */
export function logStep(jobId: string, message: string): void {
  ensureLogsDir();
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${jobId}] ${message}\n`;

  // Write to per-job log
  const jobLogPath = path.join(logsDir, `${jobId}.log`);
  fs.appendFileSync(jobLogPath, line);

  // Write to global app log
  const appLogPath = path.join(logsDir, "app.log");
  fs.appendFileSync(appLogPath, line);

  // Also log to console
  console.log(`[LOG] ${message}`);
}

/**
 * Reads all log lines for a given job.
 */
export function getJobLogs(jobId: string): string[] {
  ensureLogsDir();
  const jobLogPath = path.join(logsDir, `${jobId}.log`);
  if (!fs.existsSync(jobLogPath)) return [];
  return fs.readFileSync(jobLogPath, "utf-8").split("\n").filter(Boolean);
}

/**
 * Clears the log file for a job (used for retries).
 */
export function clearJobLogs(jobId: string): void {
  ensureLogsDir();
  const jobLogPath = path.join(logsDir, `${jobId}.log`);
  if (fs.existsSync(jobLogPath)) fs.writeFileSync(jobLogPath, "");
}
