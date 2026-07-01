// app/api/animation/route.ts — Animation generation endpoint

import { NextRequest, NextResponse } from "next/server";
import { createAnimation } from "@/lib/animation";
import { readFile } from "fs/promises";
import { publicPathToAbs } from "@/lib/fileUtils";
import { logStep } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { jobId, frameAPath, midpointPath, frameBPath } = await req.json();

    if (!jobId || !frameAPath || !midpointPath || !frameBPath) {
      return NextResponse.json({ success: false, error: "Missing required paths" }, { status: 400 });
    }

    logStep(jobId, "Building animation sequence...");

    const [bufA, bufMid, bufB] = await Promise.all([
      readFile(publicPathToAbs(frameAPath)),
      readFile(publicPathToAbs(midpointPath)),
      readFile(publicPathToAbs(frameBPath)),
    ]);

    const animationPath = await createAnimation(jobId, [bufA, bufMid, bufB], {
      delay: 60,
      width: 480,
      height: 480,
    });

    logStep(jobId, `Animation saved: ${animationPath}`);

    return NextResponse.json({ success: true, animationPath });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Animation failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
