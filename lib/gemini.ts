// lib/gemini.ts — Gemini Nano Banana API wrapper (CORE)
// Primary: gemini-3.1-flash-image via Interactions API
// Fallback: gemini-2.5-flash-image via generateContent
//
// Phase 2 note: Replace runInterpolationInference() with a real DL model call.
// The function signature stays identical — nothing else in the app changes.

import { GoogleGenAI } from "@google/genai";
import type { InterpolationInput } from "@/types";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

/**
 * Runs interpolation inference via Gemini Nano Banana image generation.
 * Returns the generated intermediate frame as a Buffer.
 */
export async function runInterpolationInference(
  input: InterpolationInput
): Promise<Buffer> {
  // Try Interactions API first (gemini-3.1-flash-image — preferred)
  try {
    return await runViaInteractionsAPI(input);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[gemini] Interactions API failed, trying generateContent fallback:", msg);
  }

  // Fallback: generateContent with gemini-2.5-flash-image
  return await runViaGenerateContent(input);
}

/**
 * Primary: Interactions API with gemini-3.1-flash-image
 * As documented in frames_context.md section 6.5
 */
async function runViaInteractionsAPI(input: InterpolationInput): Promise<Buffer> {
  const { frameABase64, frameBBase64, mimeType, prompt } = input;

  // @ts-ignore — interactions API may not be typed in older SDK versions
  const interaction = await (client as any).interactions.create({
    model: "gemini-3.1-flash-image",
    input: [
      { type: "text", text: prompt },
      { type: "image", data: frameABase64, mime_type: mimeType },
      { type: "image", data: frameBBase64, mime_type: mimeType },
    ],
  });

  // @ts-ignore
  const imageData = interaction?.output_image?.data ?? interaction?.output?.image?.data;
  if (!imageData) {
    throw new Error("Interactions API returned no image data");
  }

  return Buffer.from(imageData, "base64");
}

/**
 * Fallback: generateContent with gemini-2.5-flash-image
 * As documented in frames_context.md section 6.4
 */
async function runViaGenerateContent(input: InterpolationInput): Promise<Buffer> {
  const { frameABase64, frameBBase64, mimeType, prompt } = input;

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: frameABase64 } },
          { inlineData: { mimeType, data: frameBBase64 } },
        ],
      },
    ],
    // @ts-ignore — responseModalities valid but may be absent in older type defs
    generationConfig: {
      responseModalities: ["IMAGE"],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    // @ts-ignore
    if (part.inlineData?.data) {
      // @ts-ignore
      return Buffer.from(part.inlineData.data, "base64");
    }
  }

  throw new Error(
    "Gemini Nano Banana returned no image from either API method. Check API key and model access."
  );
}
