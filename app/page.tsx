// app/page.tsx — Landing Page

import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative flex-1 flex items-center justify-center hero-grid overflow-hidden pt-12 pb-20 px-6">
        {/* Radial spotlight */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(56,189,248,0.07) 0%, transparent 70%)"
        }} />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-xs font-semibold text-cyan-400 font-mono uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            ISRO · Gemini Nano Banana · gemini-2.5-flash-image
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            <span className="text-gradient">Fill in the</span>
            <br />
            <span className="text-[var(--text-primary)]">Frames</span>{" "}
            <span className="text-gradient">Seamlessly</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-10">
            AI-powered temporal frame interpolation for satellite imagery.
            Generate smooth intermediate observations between geostationary
            satellite frames, enhancing temporal resolution from 20-minute
            to 10-minute cadence.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/upload" id="hero-cta-start">
              <button className="btn-primary flex items-center gap-2 text-base">
                <span>Start Interpolation</span>
                <ArrowRightIcon />
              </button>
            </Link>
            <a
              href="#how-it-works"
              className="btn-secondary flex items-center gap-2 text-base"
            >
              How it works
            </a>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: "2×", label: "Temporal Resolution" },
              { value: "13", label: "Pipeline Stages" },
              { value: "~10s", label: "Generation Time" },
            ].map((stat) => (
              <div key={stat.label} className="card px-4 py-4">
                <div className="text-2xl font-extrabold text-gradient">{stat.value}</div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">How it Works</h2>
            <p className="text-[var(--text-secondary)]">
              A full AI/ML pipeline from upload to interpolated frame
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={idx} className="card p-6 flex flex-col gap-4">
                {/* Step number + icon */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center">
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest">
                    Step {idx + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">{step.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Technical Details ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="frame-badge mb-4 inline-flex">Model Architecture</div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                Powered by Gemini 2.5 Flash Image
              </h2>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                The system uses <span className="text-[var(--accent-cyan)] font-mono">gemini-2.5-flash-image</span> (Gemini Nano Banana)
                as the inference engine for this prototype phase. The architecture is designed
                as a clean wrapper — when Phase 2 deploys a real DL optical flow model
                (RIFE, SuperSloMo), only a single file changes.
              </p>
              <div className="space-y-2">
                {[
                  "13-stage DL pipeline simulation",
                  "Real image preprocessing via sharp",
                  "SSE-streamed live pipeline monitor",
                  "MSE / PSNR / SSIM / MAE metrics",
                  "GIF animation generation",
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-[var(--success)]">✓</span>
                    {feat}
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal-style code block */}
            <div className="card-glass p-5 font-mono text-xs text-[var(--text-secondary)] leading-relaxed">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-2 text-[var(--text-muted)] text-[10px]">pipeline.log</span>
              </div>
              {[
                { prefix: "→", text: "Initializing job job_2026_06_29_a1b2", color: "text-cyan-400" },
                { prefix: "✓", text: "Frame A: 512×512 PNG validated", color: "text-green-400" },
                { prefix: "✓", text: "Frame B: 512×512 PNG validated", color: "text-green-400" },
                { prefix: "→", text: "Building interpolation prompt...", color: "text-cyan-400" },
                { prefix: "→", text: "Dispatching to gemini-2.5-flash-image", color: "text-cyan-400" },
                { prefix: "⚡", text: "Generating midpoint frame...", color: "text-yellow-400" },
                { prefix: "✓", text: "Frame generated — 145320 bytes", color: "text-green-400" },
                { prefix: "✓", text: "Animation saved: /animations/.../sequence.gif", color: "text-green-400" },
                { prefix: "✓", text: "Results ready.", color: "text-green-400" },
              ].map((line, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className={line.color}>{line.prefix}</span>
                  <span>{line.text}</span>
                </div>
              ))}
              <span className="inline-block w-1.5 h-3 bg-cyan-400 animate-pulse ml-1 mt-1" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Bottom ────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-[var(--border)] text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
          Ready to interpolate?
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          Upload two satellite frames and watch the AI generate the missing moment.
        </p>
        <Link href="/upload">
          <button className="btn-primary flex items-center gap-2 mx-auto text-base" id="bottom-cta">
            Launch Interpolation →
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
          <span>FRAMES · Satellite Frame Interpolation · AI Demo</span>
          <span>gemini-2.5-flash-image · Phase 1 Prototype</span>
        </div>
      </footer>
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    icon: "🛰️",
    title: "Upload Satellite Frames",
    desc: "Provide two consecutive geostationary satellite images (PNG/JPEG). Optionally set timestamps and choose image type: Thermal IR, Visible, or Auto-detect.",
  },
  {
    icon: "⚡",
    title: "AI Pipeline Processing",
    desc: "The system runs through 13 pipeline stages — preprocessing, temporal alignment, optical flow estimation, and dispatches to the Gemini Nano Banana inference engine.",
  },
  {
    icon: "🖼️",
    title: "View & Download Results",
    desc: "See Frame A, the synthesized midpoint, and Frame B side by side. Download frames, play the animation, and view quality metrics if ground truth is provided.",
  },
];

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
