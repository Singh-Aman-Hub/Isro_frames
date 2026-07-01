// types/index.ts — Shared TypeScript types

export type ImageType = "thermal_infrared" | "visible_composite" | "auto";
export type JobStatus = "pending" | "processing" | "completed" | "error";
export type OutputResolution = 512 | 1024 | 2048;

export interface Timestamps {
  t0: string;   // e.g. "00:00 UTC"
  t1: string;   // e.g. "00:20 UTC"
  tmid: string; // e.g. "00:10 UTC"
}

export interface Metrics {
  mse: number;
  psnr: number;
  ssim: number;
  mae: number;
}

export interface Job {
  jobId: string;
  frameA: string;
  frameB: string;
  groundTruth?: string;
  generatedFrames: string[];
  animation?: string;
  timestamps: Timestamps;
  metrics?: Metrics;
  promptUsed?: string;
  modelUsed: string;
  status: JobStatus;
  logs: string[];
  createdAt: string;
  completedAt?: string;
}

export type PipelineStageStatus = "pending" | "active" | "done" | "error";

export interface PipelineStage {
  id: number;
  label: string;
  status: PipelineStageStatus;
  duration?: number;
}

export interface InterpolationInput {
  frameABase64: string;
  frameBBase64: string;
  mimeType: "image/png" | "image/jpeg";
  prompt: string;
}

export interface GenerateRequest {
  jobId: string;
  frameAPath: string;
  frameBPath: string;
  groundTruthPath?: string;
  timestamps: Timestamps;
  imageType: ImageType;
  resolution: OutputResolution;
}

export interface GenerateResponse {
  success: boolean;
  jobId?: string;
  outputPath?: string;
  animationPath?: string;
  metrics?: Metrics;
  logs?: string[];
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  jobId?: string;
  frameAPath?: string;
  frameBPath?: string;
  groundTruthPath?: string;
  error?: string;
}

export interface SSEEvent {
  type: "stage" | "log" | "complete" | "error";
  stageId?: number;
  stageStatus?: PipelineStageStatus;
  message?: string;
  data?: GenerateResponse;
}
