// app/api/metrics/route.ts — Metrics computation endpoint

import { NextRequest, NextResponse } from "next/server";
import { computeMetrics, interpretMetrics } from "@/lib/metrics";
import { logStep } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { jobId, generatedPath, groundTruthPath } = await req.json();

    if (!jobId || !generatedPath || !groundTruthPath) {
      return NextResponse.json(
        { success: false, error: "Missing jobId, generatedPath, or groundTruthPath" },
        { status: 400 }
      );
    }

    logStep(jobId, "Computing quality metrics...");
    const metrics = await computeMetrics(generatedPath, groundTruthPath);
    const interpretations = interpretMetrics(metrics);
    logStep(jobId, `Metrics: MSE=${metrics.mse}, PSNR=${metrics.psnr}dB, SSIM=${metrics.ssim}, MAE=${metrics.mae}`);

    return NextResponse.json({ success: true, metrics, interpretations });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Metrics computation failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
