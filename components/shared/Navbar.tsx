"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Wrench,
  Car,
  Bot,
  CalendarCheck,
  ShoppingBag,
  User,
  ShieldCheck,
  Menu,
  X,
  LogIn,
  LogOut,
  ChevronDown,
  ClipboardCheck,
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { useTheme } from "@/lib/context/ThemeContext";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: "Dashboard", href: "/", icon: Car },
    { label: "TORQ AI Chat", href: "/diagnose", icon: Bot, badge: "AI" },
    { label: "Garasi", href: "/garage", icon: Wrench },
    { label: "Inspeksi Mobil", href: "/inspection", icon: ClipboardCheck },
    { label: "Suku Cadang", href: "/spareparts", icon: ShoppingBag },
  ];

  return (
    <header className="sticky top-0 z-50 transition-all duration-300 px-3 sm:px-6 pt-3 pb-2">
      <div className="max-w-7xl mx-auto rounded-2xl glass-panel shadow-sm shadow-blue-500/5 px-4 sm:px-5 h-16 sm:h-18 flex items-center justify-between border border-slate-200/80 dark:border-slate-800/80 transition-colors">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer shrink-0">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white shadow-md shadow-blue-600/30 group-hover:scale-105 transition-all duration-300">
            <Wrench className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                BengkelSaku
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md tracking-wider shadow-xs">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Asisten Mekanik & Inspeksi Mobil
            </p>
          </div>
        </Link>

        {/* Desktop Modern Capsule Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs border border-slate-200/70 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-blue-600 text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Theme Toggle, OWASP Status, Auth Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            title={theme === "dark" ? "Mode Terang (Light Mode)" : "Mode Gelap (Dark Mode)"}
            aria-label="Ganti Tema Warna"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* OWASP ASI Compliance Badge */}
          <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>OWASP ASI</span>
          </span>

          {user ? (
            /* User Logged In Profile Pill */
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="min-h-[40px] pl-1.5 pr-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center gap-2 text-xs font-bold transition-all cursor-pointer"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={28}
                    height={28}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="max-w-[100px] sm:max-w-[130px] truncate">{user.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  <Link
                    href="/"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Car className="h-4 w-4 text-blue-500" />
                    <span>Executive Hub</span>
                  </Link>
                  <Link
                    href="/garage"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Wrench className="h-4 w-4 text-indigo-500" />
                    <span>Garasi Mobil Saya</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* User Not Logged In - Clean Dual CTAs */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/signin"
                className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors"
              >
                Masuk
              </Link>
              <button
                type="button"
                onClick={loginWithGoogle}
                className="px-4 sm:px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-600/25 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 group"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-200 group-hover:rotate-12 transition-transform" />
                <span>Daftar Gratis</span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
            aria-label="Buka menu navigasi"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-7xl mx-auto mt-2 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 p-3 shadow-xl space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-blue-600 dark:text-blue-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-blue-600 text-white"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            {user ? (
              <div className="p-2 space-y-2">
                <div className="flex items-center gap-2.5">
                  {user.image && (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 p-1">
                <button
                  type="button"
                  onClick={() => {
                    loginWithGoogle();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-md shadow-blue-600/25 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                  <span>Daftar / Masuk Cepat (Google)</span>
                </button>
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <LogIn className="h-4 w-4 text-slate-500" />
                  <span>Masuk via Email</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
