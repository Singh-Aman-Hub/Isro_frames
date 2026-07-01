// lib/metrics.ts — MSE, PSNR, SSIM, MAE computation using pixelmatch and raw pixel math

import sharp from "sharp";
import type { Metrics } from "@/types";

/**
 * Computes image quality metrics between a generated frame and ground truth.
 * Both images are resized to the same dimensions before comparison.
 */
export async function computeMetrics(
  generatedPath: string,
  groundTruthPath: string
): Promise<Metrics> {
  const { publicPathToAbs } = await import("./fileUtils");

  const genAbs = generatedPath.startsWith("/")
    ? publicPathToAbs(generatedPath)
    : generatedPath;
  const gtAbs = groundTruthPath.startsWith("/")
    ? publicPathToAbs(groundTruthPath)
    : groundTruthPath;

  // Read both images and normalize to same size as raw RGBA buffers
  const targetWidth = 256;
  const targetHeight = 256;
  const channels = 4; // RGBA

  const genBuffer = await sharp(genAbs)
    .resize(targetWidth, targetHeight, { fit: "fill" })
    .raw()
    .ensureAlpha()
    .toBuffer();

  const gtBuffer = await sharp(gtAbs)
    .resize(targetWidth, targetHeight, { fit: "fill" })
    .raw()
    .ensureAlpha()
    .toBuffer();

  const totalPixels = targetWidth * targetHeight;
  const totalValues = totalPixels * channels;

  // --- MSE and MAE ---
  let sumSquaredError = 0;
  let sumAbsoluteError = 0;

  for (let i = 0; i < totalValues; i++) {
    // Skip alpha channel (every 4th byte)
    if ((i + 1) % 4 === 0) continue;
    const diff = (genBuffer[i] ?? 0) - (gtBuffer[i] ?? 0);
    sumSquaredError += diff * diff;
    sumAbsoluteError += Math.abs(diff);
  }

  const numColorValues = totalPixels * 3; // RGB only
  const mse = sumSquaredError / numColorValues;
  const mae = sumAbsoluteError / numColorValues;

  // --- PSNR ---
  const maxPixelValue = 255;
  const psnr = mse === 0 ? 100 : 10 * Math.log10((maxPixelValue * maxPixelValue) / mse);

  // --- SSIM (simplified single-channel approximation) ---
  const ssim = computeSimplifiedSSIM(genBuffer, gtBuffer, totalPixels);

  return {
    mse: parseFloat(mse.toFixed(2)),
    psnr: parseFloat(psnr.toFixed(2)),
    ssim: parseFloat(ssim.toFixed(4)),
    mae: parseFloat(mae.toFixed(2)),
  };
}

/**
 * Simplified SSIM computation using global mean/variance/covariance.
 * Not windowed like full SSIM, but gives a reasonable quality estimate.
 */
function computeSimplifiedSSIM(
  img1: Buffer,
  img2: Buffer,
  totalPixels: number
): number {
  const C1 = (0.01 * 255) ** 2;
  const C2 = (0.03 * 255) ** 2;

  let sum1 = 0, sum2 = 0;
  let count = 0;

  for (let i = 0; i < img1.length; i++) {
    if ((i + 1) % 4 === 0) continue; // skip alpha
    sum1 += img1[i] ?? 0;
    sum2 += img2[i] ?? 0;
    count++;
  }

  const mean1 = sum1 / count;
  const mean2 = sum2 / count;

  let var1 = 0, var2 = 0, cov = 0;

  for (let i = 0; i < img1.length; i++) {
    if ((i + 1) % 4 === 0) continue;
    const d1 = (img1[i] ?? 0) - mean1;
    const d2 = (img2[i] ?? 0) - mean2;
    var1 += d1 * d1;
    var2 += d2 * d2;
    cov += d1 * d2;
  }

  var1 /= count;
  var2 /= count;
  cov /= count;

  const ssim =
    ((2 * mean1 * mean2 + C1) * (2 * cov + C2)) /
    ((mean1 ** 2 + mean2 ** 2 + C1) * (var1 + var2 + C2));

  return Math.max(0, Math.min(1, ssim));
}

/**
 * Returns a human-readable interpretation of metrics.
 */
export function interpretMetrics(metrics: Metrics): {
  mse: string;
  psnr: string;
  ssim: string;
  mae: string;
} {
  return {
    mse: metrics.mse < 50 ? "Excellent similarity" : metrics.mse < 200 ? "Good similarity" : "Moderate divergence",
    psnr: metrics.psnr > 30 ? "High fidelity" : metrics.psnr > 25 ? "Acceptable quality" : "Low signal quality",
    ssim: metrics.ssim > 0.9 ? "Strong structural match" : metrics.ssim > 0.8 ? "Good structural match" : "Partial structural match",
    mae: metrics.mae < 10 ? "Very low error" : metrics.mae < 30 ? "Moderate error" : "High pixel deviation",
  };
}
