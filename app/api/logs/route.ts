// app/api/logs/route.ts — Fetch logs for a job

import { NextRequest, NextResponse } from "next/server";
import { getJobLogs } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ logs: [] });
  }
  const logs = getJobLogs(jobId);
  return NextResponse.json({ logs });
}
