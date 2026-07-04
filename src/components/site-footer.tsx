import { Link } from "@tanstack/react-router";
import { Orbit } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-8 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand to-brand/50">
            <Orbit className="h-4 w-4 text-brand-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-sm font-semibold">Fill in the Missing Frames</div>
            <div className="text-xs text-muted-foreground">AI-assisted satellite frame interpolation</div>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Overview</Link>
          <Link to="/scenarios" className="hover:text-foreground">Scenarios</Link>
          <Link to="/pipeline" className="hover:text-foreground">Pipeline</Link>
          <Link to="/results" className="hover:text-foreground">Results</Link>
        </nav>
        <div className="text-xs text-muted-foreground">
          © 2024 Fill in the Missing Frames · All rights reserved.
        </div>
      </div>
    </footer>
  );
}
