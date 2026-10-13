"use client";

import React, { useEffect } from "react";
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  X,
  HelpCircle,
} from "lucide-react";

export interface DialogProps {
  isOpen: boolean;
  type?: "confirm" | "alert";
  variant?: "danger" | "warning" | "info" | "success";
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export function InteractiveDialog({
  isOpen,
  type = "confirm",
  variant = "warning",
  title,
  description,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  onClose,
}: DialogProps) {
  const handleClose = () => {
    if (onClose) onClose();
    else if (onCancel) onCancel();
    else if (onConfirm) onConfirm();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (onClose) onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bgIcon: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
      btnConfirm: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25",
      icon: Trash2,
    },
    warning: {
      bgIcon: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      btnConfirm: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25",
      icon: AlertTriangle,
    },
    info: {
      bgIcon: "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800",
      btnConfirm: "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/25",
      icon: Info,
    },
    success: {
      bgIcon: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      btnConfirm: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25",
      icon: CheckCircle2,
    },
  }[variant];

  const Icon = variantStyles.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100">
        <div className="flex items-start gap-3.5">
          <div
            className={`h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${variantStyles.bgIcon}`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
              {title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="h-7 w-7 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors -mr-1 -mt-1 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          {type === "confirm" && (
            <button
              type="button"
              onClick={onCancel || handleClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className={`min-h-[40px] px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer ${variantStyles.btnConfirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

