"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bot,
  Wrench,
  Sparkles,
  Send,
  X,
  Minus,
  Maximize2,
  ShieldCheck,
  AlertTriangle,
  PlayCircle,
  ExternalLink,
  ChevronDown,
  Car,
  BookOpen,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { getStoredVehicles } from "@/lib/storage/user-data";
import { Vehicle } from "@/types/automotive";
import { DiagnosticResponse } from "@/types/agent";
import { InteractiveDialog, DialogProps } from "@/components/shared/InteractiveDialog";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text?: string;
  diagnostic?: DiagnosticResponse;
  timestamp: string;
}

export function FloatingMechanicBot() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userKey = user?.email || "default_user";

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Global event listener to open TORQ AI from anywhere in the app
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener("open-torq-ai", handleOpen);
    return () => window.removeEventListener("open-torq-ai", handleOpen);
  }, []);

  const [dialogConfig, setDialogConfig] = useState<DialogProps>({
    isOpen: false,
    title: "",
    description: "",
    type: "alert",
    variant: "info",
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Muat riwayat percakapan per akun & sinkronkan dengan database PostgreSQL
  useEffect(() => {
    const chatKey = `bengkelsaku_ai_chat_${userKey}`;
    const defaultInitialMsg: ChatMessage[] = [
      {
        id: "msg-init",
        sender: "bot",
        text: `Halo Bos! Saya TORQ AI (Technical & Operational Reliability Quotient AI), asisten mekanik dan konsultan otomotif digital Anda di BengkelSaku.

Mode percakapan saya aktif untuk diskusi seputar dunia otomotif:
• Konsultasi keluhan mesin, bunyi kaki-kaki, AC, atau rem
• Rekomendasi oli & suku cadang sesuai buku manual mobil Anda
• Tanya-jawab estimasi biaya bengkel & tips perbaikan mandiri (DIY)
• Rekomendasi & cek kondisi mobil bekas incaran

Riwayat chat ini tersimpan aman pada akun Anda sehingga kita bisa berdiskusi secara berkelanjutan. Ada yang ingin diobrolkan hari ini?`,
        timestamp: "Baru saja",
      },
    ];

    try {
      const saved = localStorage.getItem(chatKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.warn("Gagal memuat history chat lokal:", e);
    }

    // Ambil riwayat dari database PostgreSQL
    fetch(`/api/chat/history?userKey=${encodeURIComponent(userKey)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.messages && data.messages.length > 0) {
          setMessages(data.messages);
          localStorage.setItem(chatKey, JSON.stringify(data.messages));
        } else {
          // Jika DB kosong, migrasikan pesan dari localStorage
          try {
            const saved = localStorage.getItem(chatKey);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 1) {
                fetch(`/api/chat/history?userKey=${encodeURIComponent(userKey)}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ messages: parsed }),
                }).catch(() => {});
                return;
              }
            }
          } catch (e) {}
          setMessages(defaultInitialMsg);
        }
      })
      .catch(() => {
        setMessages((prev) => (prev.length > 0 ? prev : defaultInitialMsg));
      });
  }, [userKey]);

  // Simpan riwayat chat per akun setiap ada pesan baru
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(`bengkelsaku_ai_chat_${userKey}`, JSON.stringify(messages));
      } catch (e) {
        console.warn("Gagal menyimpan history chat:", e);
      }
    }
  }, [messages, userKey]);

  useEffect(() => {
    const loaded = getStoredVehicles(userKey);
    setVehicles(loaded);
    if (loaded.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(loaded[0].id);
    }
  }, [userKey, isOpen]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleClearHistory = () => {
    setDialogConfig({
      isOpen: true,
      type: "confirm",
      variant: "danger",
      title: "Bersihkan Riwayat Chat?",
      description: "Seluruh percakapan konsultasi TORQ AI pada akun ini akan dihapus dari histori dan database.",
      confirmText: "Ya, Bersihkan",
      cancelText: "Batal",
      onConfirm: () => {
        fetch(`/api/chat/history?userKey=${encodeURIComponent(userKey)}`, {
          method: "DELETE",
        }).catch(() => {});
        const initialMsg: ChatMessage[] = [
          {
            id: `msg-${Date.now()}`,
            sender: "bot",
            text: "Riwayat chat telah dibersihkan. Halo Bos! Saya TORQ AI siap membantu konsultasi otomotif dan teknis mobil Anda. Apa yang ingin Anda diskusikan?",
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          },
        ];
        setMessages(initialMsg);
        localStorage.setItem(`bengkelsaku_ai_chat_${userKey}`, JSON.stringify(initialMsg));
        setDialogConfig((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setDialogConfig((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    // Simpan pesan user ke database PostgreSQL
    fetch(`/api/chat/history?userKey=${encodeURIComponent(userKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "user", text: textToSend }),
    }).catch(() => {});

    try {
      const selectedCar =
        vehicles.find((v) => v.id === selectedVehicleId) ||
        (vehicles.length > 0 ? vehicles[0] : null);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          vehicleContext: selectedCar
            ? {
                make: selectedCar.make,
                model: selectedCar.model,
                year: selectedCar.year,
                odometer: selectedCar.currentOdometer,
                manualGuideText: selectedCar.manualGuideText,
                manualFileName: selectedCar.manualFileName,
              }
            : null,
          userKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghubungi TORQ AI.");
      }

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: "bot",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);

      // Simpan respon bot ke database PostgreSQL
      fetch(`/api/chat/history?userKey=${encodeURIComponent(userKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "assistant", text: data.reply }),
      }).catch(() => {});
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: "bot",
          text: `Maaf Bos, terjadi kendala: ${err.message || "Gagal memproses pesan"}. Coba periksa kembali jaringan atau ulangi pertanyaan Anda.`,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Kapan jadwal servis rutin mobil saya?",
    "Bunyi kletek-kletek saat belok patah",
    "Mesin bergetar saat AC menyala",
    "Berapa estimasi biaya ganti oli & filter?",
  ];

  // Hide floating bot on dedicated full-screen TORQ AI page
  if (pathname === "/diagnose") {
    return null;
  }

  return (
    <>
      {/* Floating Interactive Chat Panel */}
      {isOpen && (
        <aside
          aria-label="Panel Konsultasi Robot TORQ AI"
          className={`fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-[9999] w-[94vw] sm:w-[430px] rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-blue-500/40 dark:border-blue-500/40 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 backdrop-blur-xl text-slate-800 dark:text-slate-100 ${
            isMinimized ? "h-14 cursor-pointer" : "h-[75vh] max-h-[620px]"
          }`}
          onClick={(e) => {
            if (isMinimized) {
              setIsMinimized(false);
            }
          }}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-3.5 border-b border-blue-500/20 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                <Bot className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white tracking-wide">TORQ AI</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                    PRO ENGINE
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  Gemini Flash • History Aktif
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearHistory();
                }}
                className="h-8 w-8 rounded-xl bg-slate-800/80 text-slate-300 hover:text-rose-400 hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Bersihkan Riwayat Chat Akun Ini"
                title="Bersihkan Riwayat Chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                className="h-8 w-8 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label={isMinimized ? "Perbesar panel" : "Perkecil panel"}
                title={isMinimized ? "Perbesar" : "Perkecil"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="h-8 w-8 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Tutup chat"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body (Hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Vehicle Context & Manual Indicator Bar */}
              <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-3.5 py-2 flex items-center justify-between text-[11px] gap-2">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 min-w-0">
                  <Car className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">Target:</span>
                  {vehicles.length > 0 ? (
                    <select
                      aria-label="Pilih kendaraan konsultasi"
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-lg px-2 py-0.5 border border-slate-200 dark:border-slate-700 shadow-xs focus:outline-none cursor-pointer truncate max-w-[170px]"
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                          {v.make} {v.model} ({v.year})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400 italic">Konsultasi Umum</span>
                  )}
                </div>

                {(() => {
                  const active =
                    vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
                  if (active?.manualGuideText) {
                    return (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold shrink-0 shadow-xs"
                        title={`Manual: ${active.manualFileName || "Panduan Kendaraan"}`}
                      >
                        <BookOpen className="h-3 w-3 text-blue-500 shrink-0" />
                        <span>Manual Aktif</span>
                      </span>
                    );
                  }
                  return (
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">Tanpa Manual</span>
                  );
                })()}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-blue-500/20 font-medium"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700 rounded-bl-none space-y-3 shadow-sm"
                      }`}
                    >
                      {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}

                      {/* Render Rich Diagnostic Response */}
                      {msg.diagnostic && (
                        <div className="space-y-3">
                          {/* Severity & Summary */}
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  msg.diagnostic.severity === "BAHAYA"
                                    ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                    : msg.diagnostic.severity === "SEDANG"
                                    ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                    : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                }`}
                              >
                                Tingkat: {msg.diagnostic.severity}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Diagnosa TORQ AI:</span>
                            </div>
                            <p className="text-slate-900 dark:text-white font-semibold">{msg.diagnostic.analysisSummary}</p>
                          </div>

                          {/* Probable Causes */}
                          {msg.diagnostic.probableCauses.length > 0 && (
                            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                              <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                                Kemungkinan Penyebab:
                              </span>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300 text-[11px]">
                                {msg.diagnostic.probableCauses.map((c, i) => (
                                  <li key={i}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Safety First Notice */}
                          {msg.diagnostic.safetyFirstNotice && (
                            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-[11px] flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                              <span className="font-medium">{msg.diagnostic.safetyFirstNotice}</span>
                            </div>
                          )}

                          {/* DIY Steps */}
                          {msg.diagnostic.diySteps.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                                Panduan Cek Mandiri:
                              </span>
                              <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                                {msg.diagnostic.diySteps.map((step, idx) => (
                                  <li key={idx} className="leading-snug">{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {/* Video Tutorials */}
                          {msg.diagnostic.videoTutorials && msg.diagnostic.videoTutorials.length > 0 && (
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                              <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-1">
                                <PlayCircle className="h-3 w-3" />
                                <span>Video Tutorial YouTube:</span>
                              </span>
                              <div className="space-y-1.5">
                                {msg.diagnostic.videoTutorials.map((v) => (
                                  <a
                                    key={v.id}
                                    href={v.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group shadow-xs cursor-pointer"
                                  >
                                    <span className="line-clamp-1 font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                      {v.title}
                                    </span>
                                    <ExternalLink className="h-3 w-3 text-slate-400 shrink-0 ml-2" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs w-fit shadow-xs">
                    <span className="h-3.5 w-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>TORQ AI sedang menganalisa data...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Pills */}
              <div className="px-3 py-2 bg-slate-100/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:text-blue-400 whitespace-nowrap transition-colors border border-slate-200 dark:border-slate-700 shadow-xs active:scale-95 shrink-0 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik keluhan mobil (contoh: rem bunyi berdecit)..."
                  className="flex-1 min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="h-11 w-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-md shadow-blue-500/25 cursor-pointer"
                  aria-label="Kirim pertanyaan ke TORQ AI"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </aside>
      )}

      {/* Floating Trigger Button (Shown ONLY when chat panel is closed) */}
      {!isOpen && (
        <aside
          aria-label="Tombol Robot TORQ AI"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[9998] flex items-end gap-3 pointer-events-auto"
        >
          {/* Speech Bubble / Tooltip */}
          {showTooltip && (
            <div
              onClick={() => {
                setIsOpen(true);
                setIsMinimized(false);
              }}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-blue-400/40 dark:border-blue-500/40 text-slate-800 dark:text-slate-100 text-xs shadow-xl animate-fade-in backdrop-blur-md cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0 animate-pulse pointer-events-none" />
              <span className="font-bold text-slate-900 dark:text-white">Ada keluhan mobil?</span>
              <span className="text-slate-500 dark:text-slate-400">Tanya TORQ AI</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                aria-label="Tutup pesan tooltip"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Animated Robot FAB Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group relative flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-2xl shadow-blue-600/40 border-2 border-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Buka Chatbot TORQ AI"
            title="Tanya TORQ AI (Asisten Mekanik Digital)"
          >
            {/* Outer Pulsing Aura */}
            <span className="absolute inset-0 rounded-3xl bg-blue-500/30 animate-ping [animation-duration:2s] -z-10 pointer-events-none" />

            {/* Rotating Conic Gradient Orbit Ring */}
            <span className="absolute -inset-1 rounded-[26px] bg-gradient-to-r from-blue-500 via-indigo-400 to-teal-400 opacity-70 blur-sm animate-[spin_6s_linear_infinite] -z-10 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Robot Head Body with Mechanical Bounce */}
            <div className="relative flex items-center justify-center animate-[bounce_2.5s_infinite] pointer-events-none">
              <Bot className="h-9 w-9 sm:h-11 sm:w-11 text-white drop-shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />

              {/* Rotating Mechanical Wrench Tool on Shoulder */}
              <div className="absolute -top-2 -right-2.5 h-7 w-7 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-lg animate-[spin_5s_linear_infinite]">
                <Wrench className="h-4 w-4" />
              </div>

              {/* Glowing Neon Cybernetic Eye Dots */}
              <span className="absolute top-2.5 sm:top-3.5 left-2 sm:left-3 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              <span className="absolute top-2.5 sm:top-3.5 right-2 sm:right-3 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee] animate-pulse" />
            </div>

            {/* Bottom Floating Status Pill */}
            <div className="absolute -bottom-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-slate-950 text-white border border-blue-500/50 shadow-md tracking-wider pointer-events-none">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>TORQ AI</span>
            </div>
          </button>
        </aside>
      )}

      {/* Interactive Custom Modal Dialog */}
      <InteractiveDialog
        {...dialogConfig}
        onClose={() => setDialogConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}

