import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Waves, Cog, Layers, Hourglass, Clock, MapPin, Satellite, Ruler,
  Rocket, Thermometer, Crosshair, Grid3x3, Wind, GitBranch, Shuffle,
  Sparkles, ShieldCheck, ImageIcon, CloudUpload, Download, Check,
  ArrowRight, Radio, Activity, Target, TrendingUp, Star, Zap,
  FileInput, SlidersHorizontal, ShieldAlert, MonitorSmartphone, Save,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getScenario, pipelineStages } from "@/lib/scenarios";
import { getSelectedScenarioId } from "@/lib/pipeline-store";

export const Route = createFileRoute("/pipeline")({
  head: () => ({
    meta: [
      { title: "Pipeline · Fill in the Missing Frames" },
      { name: "description", content: "Live view of the AI-assisted satellite frame interpolation pipeline." },
    ],
  }),
  component: PipelinePage,
});

const stageIcons = [
  Rocket, Satellite, Thermometer, Crosshair, Grid3x3, Clock, Wind,
  Shuffle, GitBranch, ShieldCheck, ImageIcon, CloudUpload, Download,
];

const workflow = [
  { i: FileInput, l: "INPUT" }, { i: SlidersHorizontal, l: "PREPARE" },
  { i: Crosshair, l: "ALIGN" }, { i: Wind, l: "FLOW" },
  { i: Shuffle, l: "WARP" }, { i: GitBranch, l: "REFINE" },
  { i: ShieldAlert, l: "VALIDATE" }, { i: MonitorSmartphone, l: "MONITOR" },
  { i: Save, l: "EXPORT" },
];

const logLines = [
  "Validating frame dimensions and metadata... ✓",
  "Normalizing radiometry to analysis-ready range.",
  "Masking invalid pixels (saturation, coastlines)... ✓",
  "ROI configured: 1024 x 1024 px",
  "Computing spatial consistency map... ✓",
  "Aligning frames with sub-pixel accuracy... ✓",
  "Temporal alignment delta: −0.21 min",
  "Computing TV-L1 optical flow field...",
  "Flow vectors computed: 1,048,576 (1024x1024)",
  "Warping Frame A to T0.5... ✓",
  "Warping Frame B to T0.5... ✓",
  "Generating fused candidate stack... ✓",
  "Running refinement U-Net (11-block v2.3)...",
];

function PipelinePage() {
  const [scenarioId, setScenarioId] = useState("cyclone");
  const scenario = getScenario(scenarioId);
  const nav = useNavigate();

  useEffect(() => { setScenarioId(getSelectedScenarioId()); }, []);

  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const start = useRef(Date.now());

  useEffect(() => {
    start.current = Date.now();
    const iv = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start.current) / 1000));
      setProgress((p) => {
        if (p >= 100) return 100;
        return Math.min(100, p + 100 / 130); // ~13 seconds
      });
    }, 100);
    return () => clearInterval(iv);
  }, []);

  const currentStage = Math.min(12, Math.floor(progress / (100 / 13)));

  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => nav({ to: "/results" }), 800);
      return () => clearTimeout(t);
    }
  }, [progress, nav]);

  const stageStates = useMemo(
    () =>
      pipelineStages.map((_, i) => {
        if (i < currentStage) return "done";
        if (i === currentStage && progress < 100) return "running";
        if (i === currentStage && progress >= 100) return "done";
        return "pending";
      }),
    [currentStage, progress]
  );

  const fmtTime = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const stageTimings = ["00:00:04","00:00:15","00:00:28","00:00:47","00:00:59","00:01:12","00:01:57","00:02:28","00:00:32","—","—","—","—"];

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 pt-12 pb-16 space-y-6">
        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Running Interpolation Pipeline
          </h1>
          <p className="mt-3 text-muted-foreground">
            Generating the missing midpoint frame from the selected satellite pair.
          </p>
        </motion.header>

        {/* Job bar */}
        <div className="glass-panel p-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          {[
            { i: Waves, l: "Scenario", v: scenario.name },
            { i: Target, l: "Mode", v: "Demo" },
            { i: GitBranch, l: "Engine", v: "Optical Flow + Refinement" },
            { i: Activity, l: "Job ID", v: "JOB-2024-05-12-0017" },
            { i: Clock, l: "Elapsed Time", v: fmtTime(elapsed) },
          ].map((c) => (
            <div key={c.l} className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent"><c.i className="h-4 w-4" /></div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{c.l}</div>
                <div className="font-mono text-sm truncate">{c.v}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          {/* PIPELINE PROGRESS */}
          <div className="glass-panel p-5">
            <div className="flex items-end justify-between">
              <div className="text-sm font-semibold tracking-wide text-muted-foreground">PIPELINE PROGRESS</div>
              <div className="font-display text-2xl font-bold text-accent">
                {Math.round(progress)}%
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-border/50">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent to-brand"
                style={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {Math.min(13, currentStage + (progress >= 100 ? 1 : 0))} of 13 stages {progress >= 100 ? "completed" : "completed"}
            </div>

            <div className="mt-5 space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {pipelineStages.map((s, i) => {
                const state = stageStates[i];
                const Icon = stageIcons[i];
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                      state === "running"
                        ? "border-brand/60 bg-brand/10 shadow-[0_0_25px_-10px_var(--brand)]"
                        : state === "done"
                        ? "border-border/40 bg-surface/30"
                        : "border-border/30 bg-surface/10"
                    }`}
                  >
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        state === "done" ? "bg-success text-background" :
                        state === "running" ? "bg-brand text-brand-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}
                    >{i + 1}</div>
                    <Icon className={`h-4 w-4 shrink-0 ${state === "pending" ? "text-muted-foreground" : "text-accent"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{s.desc}</div>
                    </div>
                    <div className="text-right shrink-0">
                      {state === "done" && <Check className="h-4 w-4 text-success ml-auto" />}
                      {state === "running" && (
                        <span className="text-[10px] font-bold text-brand tracking-wider inline-flex items-center gap-1">
                          RUNNING <Cog className="h-3 w-3 animate-spin" />
                        </span>
                      )}
                      {state === "pending" && <span className="text-[10px] text-muted-foreground tracking-wider">PENDING</span>}
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {state === "pending" ? "—" : stageTimings[i]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Pipeline stages are executed sequentially for optimal data integrity.
            </p>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="glass-panel p-5">
              <div className="text-sm font-semibold tracking-wide text-muted-foreground">SELECTED PAIR / PROCESS CONTEXT</div>
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="text-center">
                  <div className="text-xs mb-1.5 text-muted-foreground">Frame A (T0)</div>
                  <div className="overflow-hidden rounded-lg aspect-square ring-1 ring-border">
                    <img src={scenario.frameA} className="h-full w-full object-cover" alt="" />
                  </div>
                  <div className="mt-1.5 text-[11px] font-mono text-muted-foreground">{scenario.t0.split(" ")[1]}</div>
                </div>
                <div className="flex flex-col items-center text-brand">
                  <div className="text-xs text-muted-foreground">--→</div>
                  <div className="mt-1 grid h-14 w-14 place-items-center rounded-lg bg-brand/10 border border-brand/30">
                    <Hourglass className="h-6 w-6 animate-pulse" />
                  </div>
                  <div className="mt-2 text-xs font-semibold text-brand">Tmid Pending</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Being generated</div>
                  <div className="text-xs text-muted-foreground mt-1">→--</div>
                </div>
                <div className="text-center">
                  <div className="text-xs mb-1.5 text-muted-foreground">Frame B (T1)</div>
                  <div className="overflow-hidden rounded-lg aspect-square ring-1 ring-border">
                    <img src={scenario.frameB} className="h-full w-full object-cover" alt="" />
                  </div>
                  <div className="mt-1.5 text-[11px] font-mono text-muted-foreground">{scenario.t1.split(" ")[1]}</div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                {[
                  { i: Waves, k: "Event", v: scenario.event },
                  { i: MapPin, k: "Region", v: scenario.region },
                  { i: Satellite, k: "Sensor", v: scenario.sensor },
                  { i: Ruler, k: "Resolution", v: scenario.spatial },
                ].map((c) => (
                  <div key={c.k} className="rounded-lg border border-border/40 bg-surface/30 p-2.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground"><c.i className="h-3 w-3" />{c.k}</div>
                    <div className="mt-1 font-mono">{c.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Currently running */}
            <div className="glass-panel p-5">
              <div className="text-sm font-semibold tracking-wide text-muted-foreground">CURRENTLY RUNNING</div>
              <div className="text-xs text-muted-foreground mt-1">Stage {currentStage + 1} of 13</div>
              <div className="mt-1 font-display text-xl font-bold">{pipelineStages[currentStage]?.name}</div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {["Fusing warped candidates with CNN-based network","Reducing blur, ghosting, and edge artifacts","Preserving cloud-band continuity and structure","Estimating confidence for refined midpoint"].map((x) => (
                  <li key={x} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />{x}</li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Estimated time remaining:
                <span className="font-mono text-foreground">~00:0{Math.max(0, 13 - elapsed)}:00</span>
              </div>
            </div>

            {/* Logs */}
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold tracking-wide text-muted-foreground">SYSTEM LOGS <span className="text-[11px] text-muted-foreground/80 font-normal">(Live)</span></div>
                <span className="inline-flex items-center gap-1.5 text-xs text-success"><span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" /> Streaming</span>
              </div>
              <div className="mt-3 font-mono text-[11px] leading-relaxed rounded-lg bg-background/60 p-3 max-h-56 overflow-y-auto space-y-0.5">
                {logLines.slice(0, Math.min(logLines.length, currentStage + 3)).map((l, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={i === currentStage + 2 ? "text-brand" : "text-muted-foreground"}
                  >
                    <span className="text-muted-foreground/60">12:14:{String(i + 1).padStart(2, "0")}.{String((i * 137) % 999).padStart(3, "0")}</span>{" "}
                    <span className="text-accent">[INFO]</span> <span className={i < currentStage + 2 ? "text-foreground/85" : "text-brand"}>{l}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Live metrics */}
            <div className="glass-panel p-5">
              <div className="text-sm font-semibold tracking-wide text-muted-foreground">LIVE TECHNICAL METRICS</div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { i: TrendingUp, k: "Progress", v: `${Math.round(progress)}%`, s: "" },
                  { i: Wind, k: "Flow Vectors", v: "1.05M", s: "1024×1024" },
                  { i: Rocket, k: "SSIM (est.)", v: "0.912", s: "" },
                  { i: Zap, k: "PSNR (est.)", v: "32.48 dB", s: "" },
                  { i: Star, k: "Confidence", v: "0.87", s: "High" },
                  { i: Clock, k: "Runtime", v: fmtTime(elapsed), s: "Elapsed" },
                  { i: Layers, k: "Resolution", v: "1024×1024", s: "1.05 MP" },
                  { i: Thermometer, k: "Input Type", v: scenario.imageType, s: scenario.imageType === "Thermal IR" ? "11 µm Band" : "0.6 µm Band" },
                ].map((c) => (
                  <div key={c.k} className="rounded-lg border border-border/40 bg-surface/30 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wide"><c.i className="h-3 w-3 text-accent" />{c.k}</div>
                    <div className="mt-1 font-display text-lg font-bold">{c.v}</div>
                    {c.s && <div className="text-[10px] text-muted-foreground">{c.s}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Technical workflow */}
        <div className="glass-panel p-5">
          <div className="text-sm font-semibold tracking-wide text-muted-foreground mb-4">TECHNICAL WORKFLOW</div>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {workflow.map((s, i) => {
              const active = i === Math.min(workflow.length - 1, Math.floor((currentStage / 12) * (workflow.length - 1)));
              return (
                <div key={s.l} className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`grid h-12 w-12 place-items-center rounded-lg border ${active ? "border-brand bg-brand/10 text-brand shadow-[0_0_20px_-6px_var(--brand)]" : "border-border/40 bg-surface/30 text-muted-foreground"}`}>
                      <s.i className="h-5 w-5" />
                    </div>
                    <div className={`text-[10px] font-bold tracking-wider ${active ? "text-brand" : "text-muted-foreground"}`}>{s.l}</div>
                  </div>
                  {i < workflow.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
