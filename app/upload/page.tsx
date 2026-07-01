"use client";
// app/upload/page.tsx — Upload & Configuration Page

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import UploadCard from "@/components/UploadCard";
import type { ImageType, OutputResolution, Timestamps } from "@/types";

export default function UploadPage() {
  const router = useRouter();

  // Files
  const [frameA, setFrameA] = useState<File | null>(null);
  const [frameB, setFrameB] = useState<File | null>(null);
  const [groundTruth, setGroundTruth] = useState<File | null>(null);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);
  const [previewGT, setPreviewGT] = useState<string | null>(null);

  // Options
  const [timestamps, setTimestamps] = useState<Timestamps>({
    t0: "00:00 UTC",
    t1: "00:20 UTC",
    tmid: "00:10 UTC",
  });
  const [resolution, setResolution] = useState<OutputResolution>(1024);
  const [imageType, setImageType] = useState<ImageType>("auto");

  // State
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File selection handlers
  const handleFileSelect = useCallback(
    (slot: "A" | "B" | "GT") => (file: File) => {
      const url = URL.createObjectURL(file);
      if (slot === "A") { setFrameA(file); setPreviewA(url); }
      if (slot === "B") { setFrameB(file); setPreviewB(url); }
      if (slot === "GT") { setGroundTruth(file); setPreviewGT(url); }
    },
    []
  );

  // Auto-compute Tmid when T0 or T1 changes
  const computeTmid = (t0: string, t1: string): string => {
    // Try to parse simple HH:MM patterns
    const match0 = t0.match(/(\d{1,2}):(\d{2})/);
    const match1 = t1.match(/(\d{1,2}):(\d{2})/);
    if (match0 && match1) {
      const mins0 = parseInt(match0[1]!) * 60 + parseInt(match0[2]!);
      const mins1 = parseInt(match1[1]!) * 60 + parseInt(match1[2]!);
      const midMins = Math.round((mins0 + mins1) / 2);
      const h = Math.floor(midMins / 60).toString().padStart(2, "0");
      const m = (midMins % 60).toString().padStart(2, "0");
      const suffix = t0.includes("UTC") ? " UTC" : "";
      return `${h}:${m}${suffix}`;
    }
    return "T_mid";
  };

  const handleTimestampChange = (field: keyof Timestamps, value: string) => {
    setTimestamps((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "t0" || field === "t1") {
        next.tmid = computeTmid(next.t0, next.t1);
      }
      return next;
    });
  };

  // Main submit handler
  const handleGenerate = async () => {
    if (!frameA || !frameB) {
      setError("Please upload both Frame A and Frame B.");
      return;
    }
    setError(null);
    setIsUploading(true);

    try {
      // 1. Upload files
      const formData = new FormData();
      formData.append("frameA", frameA);
      formData.append("frameB", frameB);
      if (groundTruth) formData.append("groundTruth", groundTruth);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadData.success) throw new Error(uploadData.error ?? "Upload failed");

      const { jobId, frameAPath, frameBPath, groundTruthPath } = uploadData;

      // 2. Store job config in sessionStorage for the process page
      sessionStorage.setItem(
        `job_${jobId}`,
        JSON.stringify({
          jobId,
          frameAPath,
          frameBPath,
          groundTruthPath,
          timestamps,
          imageType,
          resolution,
        })
      );

      // 3. Navigate to process page
      router.push(`/process?jobId=${jobId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  const canGenerate = frameA && frameB && !isUploading;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="frame-badge mb-3 inline-flex">Upload & Configure</div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Configure Interpolation
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Upload two consecutive satellite frames and configure the interpolation parameters.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Left: Upload zones ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Frame uploads */}
            <div className="card p-6">
              <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]" />
                Input Frames
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <UploadCard
                  label="Frame A (T0)"
                  sublabel="Earlier frame"
                  colorClass="text-indigo-400"
                  onFileSelect={handleFileSelect("A")}
                  file={frameA}
                  previewUrl={previewA}
                  required
                />
                <UploadCard
                  label="Frame B (T1)"
                  sublabel="Later frame"
                  colorClass="text-blue-400"
                  onFileSelect={handleFileSelect("B")}
                  file={frameB}
                  previewUrl={previewB}
                  required
                />
              </div>
            </div>

            {/* Ground truth (optional) */}
            <div className="card p-6">
              <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                Ground Truth{" "}
                <span className="text-[var(--text-muted)] text-xs font-normal normal-case tracking-normal">
                  — Optional, enables quality metrics
                </span>
              </h2>
              <div className="max-w-xs">
                <UploadCard
                  label="Ground Truth Midpoint"
                  sublabel="If available"
                  colorClass="text-amber-400"
                  onFileSelect={handleFileSelect("GT")}
                  file={groundTruth}
                  previewUrl={previewGT}
                  required={false}
                />
              </div>
            </div>
          </div>

          {/* ── Right: Configuration ───────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Timestamps */}
            <div className="card p-5">
              <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]" />
                Timestamps
              </h2>
              <div className="space-y-3">
                {(["t0", "t1", "tmid"] as const).map((key) => (
                  <div key={key}>
                    <label className="text-[10px] text-[var(--text-muted)] font-mono uppercase block mb-1">
                      {key === "t0" ? "T0 — Frame A" : key === "t1" ? "T1 — Frame B" : "Tmid — Midpoint (auto)"}
                    </label>
                    <input
                      id={`ts-${key}`}
                      type="text"
                      value={timestamps[key]}
                      onChange={(e) => handleTimestampChange(key, e.target.value)}
                      readOnly={key === "tmid"}
                      className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-bright)] transition-colors"
                      style={{ opacity: key === "tmid" ? 0.7 : 1 }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="card p-5">
              <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]" />
                Output Resolution
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {([512, 1024, 2048] as OutputResolution[]).map((res) => (
                  <button
                    key={res}
                    id={`res-${res}`}
                    onClick={() => setResolution(res)}
                    className={`py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                      resolution === res
                        ? "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--border-bright)]"
                        : "text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--border-bright)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {res}px
                  </button>
                ))}
              </div>
            </div>

            {/* Image type */}
            <div className="card p-5">
              <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)]" />
                Image Type
              </h2>
              <div className="space-y-2">
                {[
                  { value: "thermal_infrared" as ImageType, label: "Thermal IR", desc: "TIR / T10.8µm" },
                  { value: "visible_composite" as ImageType, label: "Visible", desc: "VIS / RGB" },
                  { value: "auto" as ImageType, label: "Auto-detect", desc: "Inferred" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    id={`imgtype-${opt.value}`}
                    onClick={() => setImageType(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all ${
                      imageType === opt.value
                        ? "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--border-bright)]"
                        : "text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--border-bright)]"
                    }`}
                  >
                    <span className="font-semibold">{opt.label}</span>
                    <span className="font-mono opacity-70">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400">
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              id="btn-generate"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="spinner border-[var(--bg-base)]" />
                  Uploading...
                </>
              ) : (
                <>
                  <span>Generate Intermediate Frame</span>
                  <span>⚡</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-[var(--text-muted)] text-center font-mono">
              Powered by gemini-2.5-flash-image
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
