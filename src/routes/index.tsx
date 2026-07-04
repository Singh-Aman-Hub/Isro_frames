import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, GitBranch, Clock, Layers, Image as ImageIcon,
  Calendar, MousePointerClick, Cog, LineChart, Radio,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { scenarios } from "@/lib/scenarios";

export const Route = createFileRoute("/")({
  component: Overview,
});

const stats = [
  { icon: GitBranch, value: "13", label: "Pipeline Stages", sub: "End-to-end processing" },
  { icon: Clock, value: "~15s", label: "Demo Runtime", sub: "On standard GPU" },
  { icon: Layers, value: "5", label: "Curated Scenarios", sub: "Diverse atmospheric events" },
  { icon: ImageIcon, value: "Precomputed", label: "Midpoint Output", sub: "Instant visualization" },
];

const steps = [
  { icon: MousePointerClick, title: "Select Scenario", desc: "Choose an event pair (Frame A & B) from our curated scenarios." },
  { icon: Cog, title: "Run Interpolation Pipeline", desc: "Our multi-stage AI pipeline generates a physically consistent midpoint frame." },
  { icon: LineChart, title: "Explore Midpoint Result", desc: "Visualize and compare the generated midpoint alongside the originals." },
];

const logs = [
  { t: "12:14:02", tag: "INFO", msg: "Loading scenario: Cyclone 2024-05-12" },
  { t: "12:14:03", tag: "INFO", msg: "Ingesting Frame A (2024-05-12 06:00 UTC)" },
  { t: "12:14:04", tag: "INFO", msg: "Ingesting Frame B (2024-05-12 08:00 UTC)" },
  { t: "12:14:05", tag: "INFO", msg: "Preprocessing & Co-registration" },
  { t: "12:14:07", tag: "INFO", msg: "Cloud Masking & Normalization" },
  { t: "12:14:09", tag: "INFO", msg: "Running Interpolation Model" },
  { t: "12:14:12", tag: "INFO", msg: "Post-processing & Refinement" },
  { t: "12:14:15", tag: "SUCCESS", msg: "Midpoint generated successfully (07:00 UTC)" },
  { t: "12:14:15", tag: "INFO", msg: "Total runtime: 14.81s" },
];

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] as any },
  }),
};

function Overview() {
  const cyclone = scenarios[0];
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 pt-14 pb-24 space-y-16">
        {/* HERO */}
        <section className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <motion.div initial="hidden" animate="show" className="flex flex-col justify-center">
            <motion.h1
              variants={fade}
              custom={0}
              className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
            >
              Fill in the<br />Missing Frames
            </motion.h1>
            <motion.p variants={fade} custom={1} className="mt-5 text-lg text-accent">
              AI-assisted satellite frame interpolation for atmospheric events
            </motion.p>
            <motion.p variants={fade} custom={2} className="mt-4 max-w-lg text-muted-foreground leading-relaxed">
              Our platform improves temporal resolution between satellite observations by
              generating a physically consistent intermediate frame between Frame A and
              Frame B — revealing what happened in between.
            </motion.p>
            <motion.div variants={fade} custom={3} className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/scenarios"
                className="btn-brand hover:btn-brand-hover inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              >
                Try Demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/pipeline"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
              >
                <GitBranch className="h-4 w-4" /> View Architecture
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel p-6"
          >
            <div className="text-center text-sm font-medium text-muted-foreground">
              Interpolating the Missing Moment
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4">
              {[
                { label: "Frame A", ts: cyclone.t0, src: cyclone.frameA, mid: false },
                { label: "Generated Midpoint", ts: cyclone.tmid, src: cyclone.frameMid, mid: true },
                { label: "Frame B", ts: cyclone.t1, src: cyclone.frameB, mid: false },
              ].map((f, i) => (
                <div key={i} className="text-center">
                  <div className={`text-xs font-medium mb-2 ${f.mid ? "text-brand" : "text-muted-foreground"}`}>
                    {f.label}
                  </div>
                  <div
                    className={`relative overflow-hidden rounded-lg aspect-square ${
                      f.mid ? "ring-2 ring-brand shadow-[0_0_30px_-6px_var(--brand)]" : "ring-1 ring-border"
                    }`}
                  >
                    <img src={f.src} alt={f.label} className="h-full w-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                  </div>
                  <div className={`mt-2 text-[11px] font-mono ${f.mid ? "text-brand" : "text-muted-foreground"}`}>
                    {f.ts.split(" ")[1]} UTC
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 relative h-1 rounded-full bg-border/60">
              <div className="absolute inset-y-0 left-0 w-full flex items-center justify-between px-2">
                <div className="h-3 w-3 rounded-full bg-accent" />
                <div className="h-3 w-3 rounded-full bg-brand pulse-dot" />
                <div className="h-3 w-3 rounded-full bg-accent" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* STATS */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="glass-panel p-5"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold font-display">{s.value}</div>
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.sub}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* SCENARIO PREVIEW */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold">Scenario Preview</h2>
              <p className="text-sm text-muted-foreground">Explore curated event pairs used in the demo.</p>
            </div>
            <Link
              to="/scenarios"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface"
            >
              View All Scenarios <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {scenarios.map((sc, i) => (
              <motion.div
                key={sc.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                whileHover={{ y: -4 }}
                className="glass-panel overflow-hidden group cursor-pointer"
              >
                <div className="grid grid-cols-2 gap-1 p-1.5">
                  {[sc.frameA, sc.frameB].map((src, k) => (
                    <div key={k} className="relative aspect-square overflow-hidden rounded-md">
                      <img src={src} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                      <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {k === 0 ? "A" : "B"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{sc.name}</div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                        sc.imageType === "Thermal IR"
                          ? "bg-accent/15 text-accent"
                          : "bg-info/15 text-info"
                      }`}
                    >
                      {sc.imageType}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                    <Calendar className="h-3 w-3" />
                    {sc.t0.split(" ")[0]} · {sc.t0.split(" ")[1]}→{sc.t1.split(" ")[1]}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section>
          <div className="mb-5">
            <h2 className="font-display text-2xl font-semibold">How It Works</h2>
            <p className="text-sm text-muted-foreground">Three simple steps from scenario to insight.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-panel p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{s.desc}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* LIVE LOG + PIPELINE STAGES */}
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">System Log <span className="text-xs text-muted-foreground font-normal">(Live Preview)</span></div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
                <Radio className="h-3 w-3" /> LIVE
              </span>
            </div>
            <div className="font-mono text-[11.5px] leading-relaxed text-muted-foreground space-y-0.5 rounded-lg bg-background/60 p-3">
              {logs.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="text-muted-foreground/70">{l.t}</span>{" "}
                  <span className={l.tag === "SUCCESS" ? "text-success" : "text-accent"}>[{l.tag}]</span>{" "}
                  <span className="text-foreground/85">{l.msg}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold">Pipeline Stages</div>
              <div className="text-xs text-success font-semibold">13 / 13 Completed</div>
            </div>
            <div className="relative py-2">
              <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 bg-border" />
              <div className="absolute left-4 top-1/2 h-0.5 -translate-y-1/2 bg-accent" style={{ width: "calc(100% - 2rem)" }} />
              <div className="relative flex justify-between">
                {Array.from({ length: 13 }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
                    className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${
                      i === 12 ? "bg-success text-background" : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {i + 1}
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-7 gap-2 text-center text-[10px] text-muted-foreground">
              {["Ingest", "Preprocess", "Feature Eng.", "Model Inference", "Refinement", "Post-process", "Output"].map((s) => (
                <div key={s}>{s}</div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4 text-xs text-muted-foreground">
              <span>Model: <span className="text-foreground font-mono">SatiInterp v1.2</span></span>
              <span>Resolution: <span className="text-foreground font-mono">1 km</span></span>
              <span>Input: <span className="text-foreground font-mono">Visible + IR</span></span>
              <span>Output: <span className="text-foreground font-mono">Visible Midpoint</span></span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
