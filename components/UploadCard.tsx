"use client";
// components/UploadCard.tsx — Drag-and-drop upload zone with image preview

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

interface UploadCardProps {
  label: string;          // "Frame A (T0)", "Frame B (T1)", "Ground Truth (Optional)"
  sublabel?: string;      // "Earlier frame", "Later frame"
  colorClass?: string;    // accent color class
  onFileSelect: (file: File) => void;
  file?: File | null;
  previewUrl?: string | null;
  required?: boolean;
}

export default function UploadCard({
  label,
  sublabel,
  colorClass = "text-cyan-400",
  onFileSelect,
  file,
  previewUrl,
  required = false,
}: UploadCardProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        onFileSelect(acceptedFiles[0]);
      }
      setIsDragActive(false);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-sm font-semibold ${colorClass}`}>{label}</span>
        {required && <span className="text-xs text-red-400">*</span>}
        {sublabel && (
          <span className="text-xs text-[var(--text-muted)] font-mono">{sublabel}</span>
        )}
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`dropzone relative min-h-[200px] flex flex-col items-center justify-center gap-3 p-6 transition-all duration-200 ${
          isDragActive ? "active" : ""
        } ${previewUrl ? "border-solid" : "border-dashed"}`}
        id={`upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <input {...getInputProps()} />

        {previewUrl ? (
          /* Preview mode */
          <>
            <div className="relative w-full h-[180px] rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={`Preview of ${label}`}
                className="w-full h-full object-contain"
                style={{ background: "rgba(0,0,0,0.5)" }}
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <p className="text-xs text-white font-medium">Click to change</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[var(--success)]">
              <CheckIcon />
              <span className="text-xs font-mono truncate max-w-[180px]">
                {file?.name ?? "File loaded"}
              </span>
            </div>
          </>
        ) : (
          /* Empty state */
          <>
            <div className={`p-3 rounded-full ${isDragActive ? "bg-cyan-400/20" : "bg-[var(--bg-surface)]"} transition-colors`}>
              <UploadIcon active={isDragActive} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                {isDragActive ? "Drop to upload" : "Drag & drop or click to browse"}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">PNG, JPG, WEBP — max 10MB</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function UploadIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? "var(--accent-cyan)" : "var(--text-muted)"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
