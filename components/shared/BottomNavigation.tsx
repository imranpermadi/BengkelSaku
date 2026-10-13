"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, Wrench, CalendarCheck, ClipboardCheck, ShoppingBag } from "lucide-react";

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: Car },
    { label: "Garasi", href: "/garage", icon: Wrench },
    { label: "Servis", href: "/maintenance", icon: CalendarCheck },
    { label: "Inspeksi", href: "/inspection", icon: ClipboardCheck },
    { label: "Suku Cadang", href: "/spareparts", icon: ShoppingBag },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-2xl transition-colors duration-300"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
                isActive ? "text-blue-600 dark:text-blue-400 font-bold scale-105" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

