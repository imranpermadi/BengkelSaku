import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { BottomNavigation } from "@/components/shared/BottomNavigation";
import { FloatingMechanicBot } from "@/components/shared/FloatingMechanicBot";
import { AuthProvider } from "@/lib/context/AuthContext";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { Wrench, ShieldCheck, Activity, Sparkles, Heart } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BengkelSaku PRO — Platform Kecerdasan Otomotif AI Terdepan di Indonesia",
  description:
    "Ekosistem perawatan mobil pintar berbasis AI: telemetri real-time, inspeksi mobil bekas 25 titik, visual AR mesin, buku manual digital, dan estimasi biaya servis transparan.",
  keywords: [
    "bengkelsaku",
    "asisten mekanik ai",
    "inspeksi mobil bekas",
    "torq ai",
    "diagnosa mesin",
    "buku manual mobil",
    "katalog suku cadang oem",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-[#030712] dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white antialiased flex flex-col min-h-screen relative overflow-x-hidden">
        {/* Subtle Ambient High-Tech Light Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-grid-tech opacity-70" />

          {/* Primary Top Radial Blue Aura */}
          <div
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-blue-500/15 via-indigo-500/10 to-transparent rounded-full blur-[140px] pointer-events-none dark:from-blue-600/20 dark:via-cyan-500/10"
          />

          {/* Secondary Floating Soft Auras */}
          <div
            className="absolute top-1/3 -left-48 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"
          />
          <div
            className="absolute top-2/3 -right-48 w-96 h-96 bg-cyan-400/10 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"
          />
        </div>

        <AuthProvider>
          <ThemeProvider>
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <div className="flex-1">{children}</div>

              {/* Modern World-Class Automotive Footer */}
              <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#060b19]/80 backdrop-blur-xl pt-14 pb-24 md:pb-14 relative z-10 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="md:col-span-1 space-y-4">
                      <Link href="/" className="inline-flex items-center gap-2.5 group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25 group-hover:scale-105 transition-transform">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight flex items-center gap-1.5">
                            BengkelSaku
                            <span className="px-1.5 py-0.5 text-[9px] font-black bg-blue-600 text-white rounded-md tracking-wider">
                              PRO
                            </span>
                          </span>
                        </div>
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Platform kecerdasan otomotif berbasis AI No.1 di Indonesia. Menjaga kendaraan Anda prima, bebas salah vonis montir, dan transparan.
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Sistem TORQ AI Beroperasi Normal (99.9%)</span>
                      </div>
                    </div>

                    {/* Quick Nav */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Fitur Utama
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                        <li>
                          <Link href="/diagnose" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            TORQ AI Master Mechanic
                          </Link>
                        </li>
                        <li>
                          <Link href="/garage" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Garasi Digital & Manual Book
                          </Link>
                        </li>
                        <li>
                          <Link href="/inspection" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Inspektur Mobil Bekas (FB & OLX)
                          </Link>
                        </li>
                        <li>
                          <Link href="/ar-inspector" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Visual AR 3D Ruang Mesin
                          </Link>
                        </li>
                        <li>
                          <Link href="/spareparts" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Katalog Suku Cadang Terkurasi
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Standard & Security */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Keamanan & Standar
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                        <li className="flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          <span>OWASP ASI-2026 Compliant</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span>PostgreSQL Cloud Encrypted</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-indigo-500" />
                          <span>Powered by Gemini AI Flash</span>
                        </li>
                      </ul>
                    </div>

                    {/* Contact & Community */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                        Pemberdayaan Pemilik Mobil
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Dirancang khusus untuk pemilik mobil harian di Indonesia yang ingin mandiri, memahami kondisi mobilnya, dan menghemat biaya perawatan tahunan.
                      </p>
                      <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 font-medium">
                        Dukungan teknis & database kendaraan diperbarui berkala setiap minggu.
                      </div>
                    </div>
                  </div>

                  {/* Bottom Strip */}
                  <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <p>© 2026 BengkelSaku PRO. Hak Cipta Dilindungi Undang-Undang.</p>
                    <p className="flex items-center gap-1 text-[11px]">
                      Dibuat dengan dedikasi tinggi untuk komunitas otomotif Indonesia
                    </p>
                  </div>
                </div>
              </footer>

              <BottomNavigation />
            </div>
            <FloatingMechanicBot />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
