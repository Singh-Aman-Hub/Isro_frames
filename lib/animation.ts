// lib/animation.ts — GIF animation generation using omggif (pure JS, no native deps)

import sharp from "sharp";
import { saveAnimation } from "./fileUtils";

interface AnimationOptions {
  delay?: number;  // centiseconds (100 = 1 second)
  loop?: number;   // 0 = infinite
  width?: number;
  height?: number;
}

/**
 * Creates a GIF animation from a sequence of image buffers using omggif.
 * omggif is pure JavaScript — no native dependencies.
 * Frame order: [frameA, midpoint, frameB] for enhanced sequence.
 */
export async function createAnimation(
  jobId: string,
  frames: Buffer[],
  options: AnimationOptions = {}
): Promise<string> {
  const { delay = 60, loop = 0, width = 480, height = 480 } = options;

  try {
    const GIFEncoder = require("omggif");

    // Prepare all frames as raw RGBA pixel data at target size
    const rawFrames: Uint8ClampedArray[] = [];
    for (const frameBuffer of frames) {
      const { data } = await sharp(frameBuffer)
        .resize(width, height, { fit: "cover" })
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });
      rawFrames.push(new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength));
    }

    // Build the GIF using omggif's GifWriter
    const bufferSize = width * height * frames.length * 5 + 1000;
    const outputBuffer = Buffer.alloc(bufferSize);
    const writer = new GIFEncoder.GifWriter(outputBuffer, width, height, {
      loop: loop,
    });

    for (const rawPixels of rawFrames) {
      // Quantize RGBA to 256-color palette (simple uniform quantization)
      const { pixels, palette } = quantize(rawPixels, width, height);
      writer.addFrame(0, 0, width, height, pixels, {
        palette,
        delay,
      });
    }

    const gifBuffer = outputBuffer.slice(0, writer.end());
    return saveAnimation(jobId, gifBuffer);
  } catch (err) {
    console.warn("[animation] GIF creation failed, using CSS animation fallback:", err);
    // Return a placeholder path — UI will use CSS-based animation with individual frame paths
    return saveAnimation(jobId, Buffer.alloc(0));
  }
}

/**
 * Simple median-cut-style quantization to 256 colors for GIF encoding.
 * For satellite grayscale/near-grayscale imagery this works well.
 */
function quantize(
  rgba: Uint8ClampedArray,
  width: number,
  height: number
): { pixels: number[]; palette: number[] } {
  const pixelCount = width * height;
  const palette: number[] = [];
  const paletteMap = new Map<string, number>();

  // Build 256-color palette from most common colors
  const colorFreq = new Map<string, number>();
  for (let i = 0; i < pixelCount; i++) {
    const r = rgba[i * 4]!;
    const g = rgba[i * 4 + 1]!;
    const b = rgba[i * 4 + 2]!;
    // Quantize to 64 levels per channel to limit unique colors
    const qr = Math.round(r / 4) * 4;
    const qg = Math.round(g / 4) * 4;
    const qb = Math.round(b / 4) * 4;
    const key = `${qr},${qg},${qb}`;
    colorFreq.set(key, (colorFreq.get(key) ?? 0) + 1);
  }

  // Sort by frequency, take top 255 (leave slot 0 for background)
  const sorted = Array.from(colorFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 255);

  palette.push(0, 0, 0); // index 0: black (background)
  paletteMap.set("0,0,0", 0);

  for (let i = 0; i < sorted.length; i++) {
    const [key] = sorted[i]!;
    const [r, g, b] = key.split(",").map(Number);
    palette.push(r!, g!, b!);
    paletteMap.set(key, i + 1);
  }

  // Pad palette to power of 2 (256)
  while (palette.length < 256 * 3) palette.push(0);

  // Map each pixel to palette index
  const pixels: number[] = [];
  for (let i = 0; i < pixelCount; i++) {
    const r = rgba[i * 4]!;
    const g = rgba[i * 4 + 1]!;
    const b = rgba[i * 4 + 2]!;
    const qr = Math.round(r / 4) * 4;
    const qg = Math.round(g / 4) * 4;
    const qb = Math.round(b / 4) * 4;
    const key = `${qr},${qg},${qb}`;
    pixels.push(paletteMap.get(key) ?? 0);
  }

  return { pixels, palette };
}

/**
 * Returns animation frame paths for CSS-based AnimationPlayer fallback.
 */
export function getAnimationFramePaths(jobId: string): {
  frameA: string;
  midpoint: string;
  frameB: string;
} {
  return {
    frameA: `/uploads/${jobId}/frameA.png`,
    midpoint: `/generated/${jobId}/midpoint.png`,
    frameB: `/uploads/${jobId}/frameB.png`,
  };
}
