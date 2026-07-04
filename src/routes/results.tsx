import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CheckCircle2, Waves, Target, GitBranch, Activity, Clock, Download,
  FileText, RotateCcw, Sparkles, Eye, ImageIcon,
  BarChart3, ShieldCheck, Layers, Zap, Play, SkipBack,
  SkipForward, ArrowRight, Info, Lock, Wind,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getScenario } from "@/lib/scenarios";
import { getSelectedScenarioId } from "@/lib/pipeline-store";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results · Fill in the Missing Frames" },
      { name: "description", content: "Interpolation result with midpoint frame, technical summary, and quality metrics." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const [scenarioId, setScenarioId] = useState("cyclone");
  useEffect(() => setScenarioId(getSelectedScenarioId()), []);
  const scenario = getScenario(scenarioId);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 pt-12 pb-16 space-y-6">
        <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Interpolation Result
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Generation Complete
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Review the generated midpoint frame, compare temporal changes, and inspect technical output details.
          </p>
        </motion.header>

        {/* Job bar */}
        <div className="glass-panel p-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          {[
            { i: Waves, l: "Scenario", v: scenario.name },
            { i: Target, l: "Mode", v: "Demo" },
            { i: GitBranch, l: "Engine", v: "Optical Flow + Deep Refinement" },
            { i: Activity, l: "Job ID", v: "JOB-2024-05-12-0017" },
            { i: Clock, l: "Runtime", v: "00:14:48" },
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

        {/* Big three-frame reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-6"
        >
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4">
            {[
              { l: "Frame A (T0)", t: scenario.t0, src: scenario.frameA, mid: false },
              null,
              { l: "Generated Midpoint (Tmid)", t: scenario.tmid, src: scenario.frameMid, mid: true },
              null,
              { l: "Frame B (T1)", t: scenario.t1, src: scenario.frameB, mid: false },
            ].map((f, i) => {
              if (!f) {
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div className="h-px w-16 border-t-2 border-dashed border-accent" />
                    <ArrowRight className="h-4 w-4 text-accent -mt-2" />
                  </div>
                );
              }
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  className="text-center"
                >
                  <div className={`text-sm font-semibold mb-3 ${f.mid ? "text-brand" : "text-muted-foreground"}`}>{f.l}</div>
                  <div
                    className={`relative overflow-hidden rounded-xl aspect-square ${
                      f.mid ? "ring-2 ring-brand shadow-[0_0_50px_-10px_var(--brand)]" : "ring-1 ring-border"
                    }`}
                  >
                    <img src={f.src} className="h-full w-full object-cover" alt={f.l} loading="lazy" />
                    {f.mid && (
                      <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-md bg-brand px-3 py-1 text-[11px] font-bold text-brand-foreground shadow-lg">
                        Generated Output
                      </span>
                    )}
                  </div>
                  <div className={`mt-3 text-xs font-mono ${f.mid ? "text-brand" : "text-muted-foreground"}`}>
                    {f.t}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="grid gap-3 md:grid-cols-3">
          <button className="btn-brand hover:btn-brand-hover inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold">
            <Download className="h-4 w-4" /> Download Midpoint
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface/60 px-6 py-3.5 text-sm font-semibold hover:bg-surface">
            <FileText className="h-4 w-4" /> Download Report
          </button>
          <Link
            to="/scenarios"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface/60 px-6 py-3.5 text-sm font-semibold hover:bg-surface"
          >
            <RotateCcw className="h-4 w-4" /> Try Another Demo
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-brand" />
              <div className="font-display text-lg font-semibold">Generated Midpoint Explanation</div>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                The interpolated midpoint frame preserves the cyclonic rotation pattern observed between the
                two input frames. It reconstructs cloud-band continuity, reduces motion discontinuities, and
                provides a temporally plausible view of the atmospheric system at the missing intermediate timestamp.
              </p>
              <p>
                Optical flow guidance was used to estimate pixel displacements between observations, followed by
                deep refinement to enhance structural consistency and suppress blur and ghosting artifacts. The
                result maintains realistic cloud texture, brightness continuity, and overall coherence.
              </p>
            </div>
          </div>

          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-accent" />
              <div className="font-display text-lg font-semibold">Technical Summary</div>
            </div>
            <div className="divide-y divide-border/40 text-sm">
              {[
                ["Event", scenario.event], ["Region", scenario.region],
                ["Sensor", scenario.sensor], ["Image Type", "Visible Composite"],
                ["Spatial Resolution", scenario.spatial], ["Temporal Gap", "2 hours"],
                ["Midpoint Offset", "1 hour"], ["Output Type", "Precomputed Demo Result"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-2 gap-3 py-2.5">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-5 w-5 text-accent" />
              <div className="font-display text-lg font-semibold">Observed Changes</div>
            </div>
            <ul className="space-y-2 text-sm">
              {[
                "Spiral cloud bands shift clockwise.",
                "Central dense overcast becomes more compact.",
                "Outer cloud edges move northeast.",
                "Brightness continuity preserved across cloud mass.",
                "Intermediate frame improves temporal smoothness for monitoring.",
              ].map((x) => (
                <li key={x} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  <span className="text-muted-foreground">{x}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-accent" />
              <div className="font-display text-lg font-semibold">Event Timeline</div>
            </div>
            <div className="relative mt-6 pb-8">
              <div className="absolute inset-x-4 top-3 h-0.5 bg-border" />
              <div className="relative flex justify-between">
                {[
                  { l: "T0", t: scenario.t0, s: "Observed Frame A", sub: "Initial Observation", color: "info" },
                  { l: "Tmid", t: scenario.tmid, s: "Generated Midpoint", sub: "Interpolated Output", color: "brand" },
                  { l: "T1", t: scenario.t1, s: "Observed Frame B", sub: "Later Observation", color: "info" },
                ].map((p) => (
                  <div key={p.l} className="flex flex-col items-center text-center max-w-[32%]">
                    <div className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
                      p.color === "brand" ? "bg-brand text-brand-foreground shadow-[0_0_15px_-2px_var(--brand)]" : "bg-info text-background"
                    }`}>{p.l[0]}</div>
                    <div className={`mt-2 text-xs font-semibold ${p.color === "brand" ? "text-brand" : "text-muted-foreground"}`}>{p.l}</div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{p.t}</div>
                    <div className={`mt-1 text-[11px] font-semibold ${p.color === "brand" ? "text-brand" : "text-foreground"}`}>{p.s}</div>
                    <div className="text-[10px] text-muted-foreground">{p.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Animation player */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-3">
              <Play className="h-5 w-5 text-brand" />
              <div className="font-display text-lg font-semibold">Animation & Comparison</div>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3">
              {[
                { l: "T0", t: "06:00 UTC", src: scenario.frameA, mid: false },
                null,
                { l: "Tmid", t: "07:00 UTC", src: scenario.frameMid, mid: true },
                null,
                { l: "T1", t: "08:00 UTC", src: scenario.frameB, mid: false },
              ].map((f, i) => {
                if (!f) return <ArrowRight key={i} className="h-4 w-4 text-accent" />;
                return (
                  <div key={i} className="text-center">
                    <div className={`overflow-hidden rounded-lg aspect-square ${f.mid ? "ring-2 ring-brand" : "ring-1 ring-border"}`}>
                      <img src={f.src} className="h-full w-full object-cover" alt="" loading="lazy" />
                    </div>
                    <div className={`mt-2 text-xs font-semibold ${f.mid ? "text-brand" : "text-muted-foreground"}`}>{f.l}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{f.t}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground"><Play className="h-4 w-4 ml-0.5" /></button>
              <button className="grid h-8 w-8 place-items-center rounded-full border border-border"><SkipBack className="h-3.5 w-3.5" /></button>
              <button className="grid h-8 w-8 place-items-center rounded-full border border-border"><SkipForward className="h-3.5 w-3.5" /></button>
              <div className="text-xs font-mono text-muted-foreground">00:00 / 00:06</div>
              <div className="flex-1 h-1 rounded-full bg-border/60">
                <div className="h-full w-1/3 rounded-full bg-accent" />
              </div>
              <div className="text-xs text-muted-foreground">Speed <span className="font-mono">1.0x</span></div>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                Compare
                <span className="relative inline-flex h-4 w-7 rounded-full bg-brand"><span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-brand-foreground" /></span>
              </label>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Info className="h-3 w-3" /> Use the slider to inspect differences between original frames and the generated output.</p>
          </div>

          {/* Quality metrics */}
          <div className="glass-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-brand" />
              <div className="font-display text-lg font-semibold">Quality Metrics</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { i: Target, k: "SSIM (est.)", v: "0.912" },
                { i: Zap, k: "PSNR (est.)", v: "32.48 dB" },
                { i: ShieldCheck, k: "Confidence", v: "0.87", sub: "High" },
              ].map((c) => (
                <div key={c.k} className="rounded-lg border border-border/40 bg-surface/30 p-4 text-center">
                  <c.i className="mx-auto h-6 w-6 text-accent" />
                  <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{c.k}</div>
                  <div className="mt-1 font-display text-xl font-bold">{c.v}</div>
                  {c.sub && <div className="text-[10px] text-success">{c.sub}</div>}
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                { i: Layers, k: "Resolution", v: "1024×1024", sub: "1.05 MP" },
                { i: ImageIcon, k: "Output Size", v: "1.05 MP" },
              ].map((c) => (
                <div key={c.k} className="rounded-lg border border-border/40 bg-surface/30 p-4">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground"><c.i className="h-3 w-3" />{c.k}</div>
                  <div className="mt-1 font-display text-lg font-bold">{c.v}</div>
                  {c.sub && <div className="text-[10px] text-muted-foreground">{c.sub}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model stack */}
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-accent" />
            <div className="font-display text-lg font-semibold">Model Stack / Methods Used</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { i: Wind, t: "TV-L1", s: "Optical Flow" },
              { i: GitBranch, t: "Farneback", s: "Baseline" },
              { i: Sparkles, t: "CNN / U-Net", s: "Refinement" },
              { i: CheckCircle2, t: "SSIM / PSNR / MSE", s: "Validation" },
              { i: FileText, t: "NetCDF-ready", s: "Monitoring Output" },
            ].map((c) => (
              <div key={c.t} className="rounded-lg border border-border/40 bg-surface/30 p-4 text-center">
                <c.i className="mx-auto h-6 w-6 text-accent" />
                <div className="mt-2 font-semibold text-sm">{c.t}</div>
                <div className="text-[11px] text-muted-foreground">{c.s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/40 bg-surface/30 px-4 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-info" /> This is a simulated demo using precomputed data. No data leaves your browser. Entirely simulated.</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Secure</span>
            <span>· Private</span>
            <span>· Local Processing</span>
          </span>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
