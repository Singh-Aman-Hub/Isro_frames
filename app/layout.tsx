// app/layout.tsx — Root layout

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fill in the Frames — Satellite Frame Interpolation",
  description:
    "AI-powered temporal frame interpolation for satellite imagery. Generate smooth intermediate frames between geostationary satellite observations using Gemini Nano Banana.",
  keywords: ["satellite", "frame interpolation", "ISRO", "AI", "temporal resolution", "INSAT", "Gemini"],
  openGraph: {
    title: "Fill in the Frames — Satellite Frame Interpolation",
    description: "AI-powered satellite frame interpolation powered by Gemini Nano Banana",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
