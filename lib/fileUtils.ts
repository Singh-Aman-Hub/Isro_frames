// lib/fileUtils.ts — File management, job folder creation, UUID helpers

import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const OUTPUT_BASE = process.env.OUTPUT_BASE_DIR ?? "public";

/**
 * Generates a unique job ID with date prefix for traceability.
 */
export function generateJobId(): string {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0].replace(/-/g, "_");
  const shortId = uuidv4().split("-")[0];
  return `job_${dateStr}_${shortId}`;
}

/**
 * Ensures all required directories for a job exist.
 */
export function ensureJobDirs(jobId: string): {
  uploadsDir: string;
  generatedDir: string;
  animationsDir: string;
  logsDir: string;
} {
  const uploadsDir = path.join(process.cwd(), OUTPUT_BASE, "uploads", jobId);
  const generatedDir = path.join(process.cwd(), OUTPUT_BASE, "generated", jobId);
  const animationsDir = path.join(process.cwd(), OUTPUT_BASE, "animations", jobId);
  const logsDir = path.join(process.cwd(), "logs");

  for (const dir of [uploadsDir, generatedDir, animationsDir, logsDir]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return { uploadsDir, generatedDir, animationsDir, logsDir };
}

/**
 * Saves the generated frame buffer and returns its public URL path.
 */
export function saveGeneratedFrame(jobId: string, buffer: Buffer): string {
  const { generatedDir } = ensureJobDirs(jobId);
  const filename = "midpoint.png";
  const fullPath = path.join(generatedDir, filename);
  fs.writeFileSync(fullPath, buffer);
  return `/generated/${jobId}/${filename}`;
}

/**
 * Saves a GIF animation and returns its public URL path.
 */
export function saveAnimation(jobId: string, buffer: Buffer): string {
  const { animationsDir } = ensureJobDirs(jobId);
  const filename = "sequence.gif";
  const fullPath = path.join(animationsDir, filename);
  fs.writeFileSync(fullPath, buffer);
  return `/animations/${jobId}/${filename}`;
}

/**
 * Reads a file from an absolute or public-relative path and returns its contents.
 */
export function readFileBuffer(filePath: string): Buffer {
  const absPath = filePath.startsWith("/")
    ? path.join(process.cwd(), "public", filePath)
    : filePath;
  return fs.readFileSync(absPath);
}

/**
 * Returns the absolute filesystem path for a public URL path.
 */
export function publicPathToAbs(publicPath: string): string {
  return path.join(process.cwd(), "public", publicPath);
}

/**
 * Validates MIME type from a Buffer by inspecting magic bytes.
 */
export function detectMimeType(buffer: Buffer): "image/png" | "image/jpeg" | null {
  // PNG: starts with 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return "image/png";
  // JPEG: starts with FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "image/jpeg";
  return null;
}
