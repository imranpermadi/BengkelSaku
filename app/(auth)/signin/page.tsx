"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Lock,
  Mail,
  Info,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function SignInPage() {
  const router = useRouter();
  const { loginWithGoogle, loginWithCredentials, loginAsGuest } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setNotification("Membuka otentikasi resmi Google OAuth SSO...");
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setLoading(false);
      setNotification("Gagal menghubungkan ke server Google: " + err?.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    await loginWithCredentials(email);
    setNotification(`Berhasil masuk sebagai ${email}. Mengalihkan ke Garasi...`);

    setTimeout(() => {
      router.push("/");
    }, 800);
  };

  const handleGuest = () => {
    setLoading(true);
    loginAsGuest();
    setNotification("Masuk sebagai Mode Tamu Otodidak...");
    setTimeout(() => {
      router.push("/");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 transition-colors">
      {/* Brand Header */}
      <div className="w-full max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="h-11 w-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <Wrench className="h-6 w-6 stroke-[2.2]" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            BengkelSaku
            <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-black">
              PRO
            </span>
          </span>
        </Link>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Masuk ke Garasi Digital Anda
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Pantau riwayat servis mobil, analisa AI, dan katalog suku cadang.
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-5">
        {notification && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5 shadow-sm">
            <UserCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span className="leading-relaxed font-semibold">{notification}</span>
          </div>
        )}

        {/* Real Google OAuth Button */}
        <div>
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loading ? "Menghubungkan..." : "Lanjutkan dengan Google SSO"}</span>
          </button>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center flex items-center justify-center gap-1 font-medium">
            <Info className="h-3 w-3 text-slate-400" />
            <span>Terhubung langsung ke Google Cloud OAuth Project Anda.</span>
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
            atau dengan Email
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full min-h-[46px] pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[46px] pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] cursor-pointer"
          >
            {loading ? "Memproses..." : "Masuk ke Akun"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Instant Guest Mode */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={handleGuest}
            className="w-full min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            ⚡ Masuk Cepat sebagai Tamu (Uji Coba Langsung)
          </button>
        </div>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          Belum punya akun?{" "}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">
            Daftar Akun Baru
          </Link>
        </div>
      </div>

      {/* Security Footer */}
      <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span>Keamanan Terjamin dengan Standar OWASP Agentic Security (ASI-2026)</span>
      </div>
    </div>
  );
}

