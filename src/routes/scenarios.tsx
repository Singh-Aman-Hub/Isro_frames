import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight, Upload, Layers, Info, MapPin, Satellite, Image as ImageIcon,
  Ruler, Clock, Lock, Waves, Wind, Flame, Building2, CloudRain, Calendar,
  MousePointerClick, Cog, LineChart, Globe, Shield, ChevronRight,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { scenarios } from "@/lib/scenarios";
import { setSelectedScenarioId } from "@/lib/pipeline-store";

export const Route = createFileRoute("/scenarios")({
  head: () => ({
    meta: [
      { title: "Scenarios · Fill in the Missing Frames" },
      { name: "description", content: "Choose a curated satellite image pair and run the interpolation pipeline." },
    ],
  }),
  component: ScenariosPage,
});

const iconMap: Record<string, any> = {
  cyclone: Waves, flood: CloudRain, fire: Flame, dust: Wind, urban: Building2,
};

function ScenariosPage() {
  const [selectedId, setSelectedId] = useState("cyclone");
  const [tab, setTab] = useState<"demo" | "custom">("demo");
  const nav = useNavigate();
  const selected = scenarios.find((s) => s.id === selectedId)!;

  const run = () => {
    setSelectedScenarioId(selectedId);
    nav({ to: "/pipeline" });
  };

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 pt-12 pb-20 space-y-10">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Choose a Demo Scenario
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Select a curated satellite image pair and run the interpolation pipeline
            to reveal the missing moment.
          </p>
        </motion.header>

        <div className="flex items-center gap-1 border-b border-border/50">
          <button
            onClick={() => setTab("demo")}
            className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
              tab === "demo" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" /> Demo Scenarios
            {tab === "demo" && (
              <motion.div layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand" />
            )}
          </button>
          <button
            onClick={() => setTab("custom")}
            className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
              tab === "custom" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-4 w-4" /> Custom Upload
            {tab === "custom" && (
              <motion.div layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === "demo" ? (
            <motion.div
              key="demo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 lg:grid-cols-[1.15fr_1fr]"
            >
              {/* SCENARIO LIST */}
              <div className="space-y-3">
                {scenarios.map((sc, i) => {
                  const Icon = iconMap[sc.id] ?? Layers;
                  const active = sc.id === selectedId;
                  return (
                    <motion.button
                      key={sc.id}
                      onClick={() => setSelectedId(sc.id)}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 2 }}
                      className={`glass-panel w-full text-left p-3 flex gap-4 items-center transition-all ${
                        active ? "ring-2 ring-brand shadow-[0_0_30px_-8px_var(--brand)]" : "hover:border-border"
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-1 shrink-0">
                        {[sc.frameA, sc.frameB].map((src, k) => (
                          <div key={k} className="relative h-20 w-20 overflow-hidden rounded-md">
                            <img src={src} className="h-full w-full object-cover" alt="" loading="lazy" />
                            <span className="absolute left-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-semibold text-white">
                              {k === 0 ? "A" : "B"}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-accent" />
                          <div className="font-semibold">{sc.name}</div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{sc.description}</p>
                        <span
                          className={`mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-medium ${
                            sc.imageType === "Thermal IR" ? "bg-accent/15 text-accent" : "bg-info/15 text-info"
                          }`}
                        >
                          {sc.imageType}
                        </span>
                        <div className="mt-2 space-y-0.5 text-[10.5px] font-mono text-muted-foreground">
                          <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> T0 {sc.t0}</div>
                          <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> T1 {sc.t1}</div>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-brand" : "text-muted-foreground"}`} />
                    </motion.button>
                  );
                })}
              </div>

              {/* PREVIEW PANEL */}
              <div className="glass-panel p-5 h-fit lg:sticky lg:top-24">
                <div className="text-sm font-semibold">Selected Scenario Preview</div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      <div className="text-center">
                        <div className="text-xs mb-1.5 text-muted-foreground">Frame A (T0)</div>
                        <div className="overflow-hidden rounded-lg aspect-square ring-1 ring-border">
                          <img src={selected.frameA} className="h-full w-full object-cover" alt="" />
                        </div>
                        <div className="mt-1.5 text-[11px] font-mono text-muted-foreground">{selected.t0.split(" ")[1]}</div>
                      </div>
                      <div className="flex flex-col items-center gap-1 text-brand">
                        <div className="h-14 w-14 rounded-full border-2 border-dashed border-brand grid place-items-center pulse-dot">
                          <Cog className="h-6 w-6 animate-spin" style={{ animationDuration: "6s" }} />
                        </div>
                        <div className="text-[11px] font-mono">Tmid</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs mb-1.5 text-muted-foreground">Frame B (T1)</div>
                        <div className="overflow-hidden rounded-lg aspect-square ring-1 ring-border">
                          <img src={selected.frameB} className="h-full w-full object-cover" alt="" />
                        </div>
                        <div className="mt-1.5 text-[11px] font-mono text-muted-foreground">{selected.t1.split(" ")[1]}</div>
                      </div>
                    </div>

                    <div className="mt-6 divide-y divide-border/50 rounded-lg border border-border/50 text-sm">
                      {[
                        { icon: Waves, k: "Event", v: selected.event },
                        { icon: MapPin, k: "Region", v: selected.region },
                        { icon: Satellite, k: "Sensor", v: selected.sensor },
                        { icon: ImageIcon, k: "Image Type", v: selected.imageType },
                        { icon: Ruler, k: "Spatial Resolution", v: selected.spatial },
                        { icon: Clock, k: "Temporal Delta", v: "2 hours" },
                      ].map((r) => (
                        <div key={r.k} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5">
                          <r.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{r.k}</span>
                          <span className="font-mono text-xs">{r.v}</span>
                        </div>
                      ))}
                      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2.5">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Demo Mode</span>
                        <span className="rounded bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand">Precomputed Midpoint</span>
                      </div>
                    </div>



                    <button
                      onClick={run}
                      className="btn-brand hover:btn-brand-hover mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold"
                    >
                      Run Interpolation Pipeline <ArrowRight className="h-4 w-4" />
                    </button>
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                      <Lock className="h-3 w-3" /> No data leaves your browser. Entirely simulated.
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-12 text-center"
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-display text-xl font-semibold">Custom Upload (Phase 2)</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Bring your own satellite image pair in Phase 2. For this demo, please use one of the curated scenarios.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WHAT HAPPENS NEXT */}
        <section className="glass-panel p-6">
          <div className="mb-4 font-semibold">What happens next</div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { i: MousePointerClick, t: "Select a Pair", d: "Choose a scenario with two satellite frames (T0 and T1)." },
              { i: Cog, t: "Pipeline Simulation", d: "We simulate the interpolation pipeline across 13 stages." },
              { i: LineChart, t: "Explore Midpoint Result", d: "View the generated midpoint and compare with originals." },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-surface/40 p-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground text-sm font-bold">{i + 1}</div>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent"><s.i className="h-4 w-4" /></div>
                <div>
                  <div className="font-semibold text-sm">{s.t}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel p-6">
          <div className="mb-4 font-semibold">Scenario Details</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            {[
              { i: Globe, t: "Event Coverage", d: "Global scenarios across oceans, land, and urban environments." },
              { i: Clock, t: "Timestamps", d: "All times in UTC. Pairs are spaced 2–3 hours apart for meaningful change." },
              { i: Satellite, t: "Sensor & Data", d: "Sourced from trusted satellite missions. Cloud-masked and calibrated." },
              { i: Shield, t: "Quality Notes", d: "Preprocessed for consistency. Not all real-world artifacts are represented." },
            ].map((c) => (
              <div key={c.t}>
                <div className="flex items-center gap-2 font-semibold"><c.i className="h-4 w-4 text-accent" />{c.t}</div>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
