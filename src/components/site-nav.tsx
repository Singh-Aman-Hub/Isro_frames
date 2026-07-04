import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Orbit } from "lucide-react";

const nav = [
  { to: "/", label: "Overview" },
  { to: "/scenarios", label: "Scenarios" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/results", label: "Results" },
] as const;

export function SiteNav() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand to-brand/50 shadow-[0_0_20px_-4px_var(--brand)]">
            <Orbit className="h-4 w-4 text-brand-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            Fill in the Missing Frames
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
                {active && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/scenarios"
          className="btn-brand hover:btn-brand-hover inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold"
        >
          Try Demo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
