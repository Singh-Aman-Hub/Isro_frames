"use client";
// components/Navbar.tsx — Navigation bar with satellite aesthetic

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/upload", label: "Interpolate" },
  ];

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-md bg-gradient-to-br from-cyan-400 to-blue-600 opacity-90" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-sm font-bold text-gradient">FRAMES</span>
            <span className="text-xs text-[var(--text-muted)] block -mt-1 font-mono">ISRO · AI Demo</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                pathname === link.href
                  ? "bg-[var(--accent-glow)] text-[var(--accent-cyan)] border border-[var(--border-bright)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="GitHub"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
}
