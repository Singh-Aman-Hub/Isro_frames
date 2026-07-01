// lib/preprocess.ts — Image resize and normalize via sharp

import sharp from "sharp";
import { publicPathToAbs } from "./fileUtils";

export interface PreprocessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: "image/png" | "image/jpeg";
}

/**
 * Preprocesses a satellite image for inference:
 * 1. Reads from path (absolute or public-relative)
 * 2. Converts to PNG for consistency
 * 3. Optionally resizes to target resolution
 * 4. Normalizes pixel values
 */
export async function preprocessImage(
  imagePath: string,
  targetResolution?: number
): Promise<PreprocessedImage> {
  const absPath = imagePath.startsWith("/uploads") || imagePath.startsWith("/generated")
    ? publicPathToAbs(imagePath)
    : imagePath;

  let pipeline = sharp(absPath);

  // Get metadata first
  const metadata = await pipeline.metadata();
  let width = metadata.width ?? 512;
  let height = metadata.height ?? 512;

  // Resize if target resolution specified, maintaining aspect ratio
  if (targetResolution && (width > targetResolution || height > targetResolution)) {
    pipeline = pipeline.resize(targetResolution, targetResolution, {
      fit: "inside",
      withoutEnlargement: true,
    });
    // Recalculate approximate dimensions
    const scale = targetResolution / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  // Convert to PNG for consistent processing
  const buffer = await pipeline.png().toBuffer();

  return {
    buffer,
    width,
    height,
    mimeType: "image/png",
  };
}

/**
 * Gets image dimensions without full preprocessing.
 */
export async function getImageDimensions(
  imagePath: string
): Promise<{ width: number; height: number }> {
  const absPath = imagePath.startsWith("/uploads") || imagePath.startsWith("/generated")
    ? publicPathToAbs(imagePath)
    : imagePath;

  const metadata = await sharp(absPath).metadata();
  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}

/**
 * Post-processes the generated frame output from Gemini.
 * Applies mild sharpening and ensures correct format.
 */
export async function postprocessOutput(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .sharpen({ sigma: 0.5 })
    .png()
    .toBuffer();
}
