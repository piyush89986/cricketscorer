import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AuthProvider from "@/components/layout/AuthProvider";

export const metadata: Metadata = {
  title: "CricScore — Cricket Tournament Management & Live Scoring Platform",
  description: "Digital tournament management, real-time ball-by-ball scoring, TV scoreboard display, and live match analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080d1a] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

