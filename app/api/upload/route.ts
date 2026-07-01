// app/api/upload/route.ts — File upload handler

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { generateJobId } from "@/lib/fileUtils";
import { logStep } from "@/lib/logger";
import type { UploadResponse } from "@/types";

const MAX_UPLOAD_BYTES = parseInt(process.env.MAX_UPLOAD_MB ?? "10") * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export async function POST(req: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await req.formData();
    const frameA = formData.get("frameA") as File | null;
    const frameB = formData.get("frameB") as File | null;
    const groundTruth = formData.get("groundTruth") as File | null;

    if (!frameA || !frameB) {
      return NextResponse.json(
        { success: false, error: "Both Frame A and Frame B are required." },
        { status: 400 }
      );
    }

    // Validate MIME types
    for (const [name, file] of [["Frame A", frameA], ["Frame B", frameB]] as const) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `${name} must be PNG, JPEG, or WEBP. Got: ${file.type}` },
          { status: 400 }
        );
      }
    }

    // Validate file sizes
    for (const [name, file] of [["Frame A", frameA], ["Frame B", frameB]] as const) {
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { success: false, error: `${name} exceeds ${process.env.MAX_UPLOAD_MB ?? 10}MB limit.` },
          { status: 400 }
        );
      }
    }

    // Create job ID and directories
    const jobId = generateJobId();
    const uploadsDir = path.join(process.cwd(), "public", "uploads", jobId);
    await mkdir(uploadsDir, { recursive: true });

    logStep(jobId, "Job created");
    logStep(jobId, `Saving Frame A: ${frameA.name} (${frameA.size} bytes)`);

    // Save Frame A
    const frameABuffer = Buffer.from(await frameA.arrayBuffer());
    const frameAFilename = "frameA.png";
    await writeFile(path.join(uploadsDir, frameAFilename), frameABuffer);
    const frameAPath = `/uploads/${jobId}/${frameAFilename}`;

    logStep(jobId, `Saving Frame B: ${frameB.name} (${frameB.size} bytes)`);

    // Save Frame B
    const frameBBuffer = Buffer.from(await frameB.arrayBuffer());
    const frameBFilename = "frameB.png";
    await writeFile(path.join(uploadsDir, frameBFilename), frameBBuffer);
    const frameBPath = `/uploads/${jobId}/${frameBFilename}`;

    // Save Ground Truth (optional)
    let groundTruthPath: string | undefined;
    if (groundTruth && groundTruth.size > 0) {
      logStep(jobId, `Saving Ground Truth: ${groundTruth.name}`);
      const gtBuffer = Buffer.from(await groundTruth.arrayBuffer());
      const gtFilename = "groundTruth.png";
      await writeFile(path.join(uploadsDir, gtFilename), gtBuffer);
      groundTruthPath = `/uploads/${jobId}/${gtFilename}`;
    }

    logStep(jobId, "Upload complete. Job ready for generation.");

    return NextResponse.json({
      success: true,
      jobId,
      frameAPath,
      frameBPath,
      groundTruthPath,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[upload] Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
