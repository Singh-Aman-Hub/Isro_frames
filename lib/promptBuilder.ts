// lib/promptBuilder.ts — Satellite frame interpolation prompt construction

import type { ImageType, Timestamps } from "@/types";

export interface PromptOptions {
  timestamps?: Partial<Timestamps>;
  imageType?: ImageType;
}

/**
 * Builds a strict, science-accurate satellite frame interpolation prompt.
 * This prompt is designed to suppress Gemini's creative image generation
 * tendencies and force it to act as a temporal interpolation engine.
 */
export function buildInterpolationPrompt(options: PromptOptions = {}): string {
  const {
    timestamps,
    imageType = "auto",
  } = options;

  const t0Label = timestamps?.t0 ?? "T0";
  const t1Label = timestamps?.t1 ?? "T1";
  const tmidLabel = timestamps?.tmid ?? "T_mid";

  const typeInstruction = getTypeInstruction(imageType);

  return `
You are a satellite frame interpolation engine.

You are given two consecutive geostationary satellite observation frames:
- Reference Image 1: time ${t0Label} (earlier frame)
- Reference Image 2: time ${t1Label} (later frame)

Your task: Generate exactly ONE synthetic intermediate satellite image representing the midpoint time ${tmidLabel} between these two observations.

${typeInstruction}

Strict interpolation rules:
- Preserve the same geographic region, crop, framing, projection, and orientation.
- Preserve the same image scale and aspect ratio as the input images.
- Smoothly interpolate cloud motion, cloud deformation, storm band displacement, and atmospheric shape transitions.
- Smoothly interpolate brightness and contrast evolution between the two frames.
- Do NOT add labels, legends, text, timestamps, arrows, colorbars, or any UI elements.
- Do NOT introduce new weather systems not present in either input frame.
- Do NOT remove major cloud structures that are present in both input frames.
- Do NOT apply artistic stylization, painterly effects, or creative enhancements.
- Do NOT hallucinate land/ocean shifts or geographically inconsistent features.
- The output must be photometrically consistent with both reference frames.

Output format:
- Return ONLY the interpolated intermediate frame as an image.
- No text, no explanation, no borders, no watermarks.
`.trim();
}

function getTypeInstruction(imageType: ImageType): string {
  switch (imageType) {
    case "thermal_infrared":
      return "The images are thermal infrared satellite frames. Preserve grayscale intensity patterns and realistic cloud morphology. The output must remain a clean thermal infrared satellite-style image. Cold cloud tops appear bright; warm surfaces appear dark.";
    case "visible_composite":
      return "The images are visible composite satellite frames. Preserve the same color palette, albedo levels, and visual mapping as the provided reference images.";
    default:
      return "Preserve the same imaging style, color palette, brightness scale, and visual characteristics as the input frames.";
  }
}
