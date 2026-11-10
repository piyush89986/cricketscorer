import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AuthProvider from "@/components/layout/AuthProvider";

export const metadata: Metadata = {
  title: "CricScore — Cricket Tournament Management & Live Scoring Platform",
  description: "Digital cricket tournament management, real-time ball-by-ball scoring, TV scoreboard display, and live match analytics.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
