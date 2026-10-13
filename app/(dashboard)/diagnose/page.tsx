"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Bot,
  User,
  Send,
  Camera,
  Image as ImageIcon,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Video,
  ShoppingBag,
  RotateCcw,
  Car,
  Wrench,
  X,
  ExternalLink,
  Zap,
} from "lucide-react";
import { DiagnosticResponse } from "@/types/agent";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  image?: string;
  diagnosisData?: DiagnosticResponse;
}

const QUICK_PROMPTS = [
  "Ada bunyi decit kencang saat pedal rem ditekan",
  "Oli menetes di lantai garasi bagian bawah mesin",
  "Mesin brebet dan bergetar saat tarikan gas rendah",
  "AC mobil hanya keluar angin hangat tidak dingin",
];

export default function DiagnoseChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: "Halo Bos! Saya TORQ AI, Master Mechanic AI BengkelSaku. Apa gejala atau keluhan mobil yang ingin Anda periksa hari ini? Anda bisa ketik keluhan atau kirim foto komponen di bawah kap mesin.",
      timestamp: "Baru saja",
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const complaint = textToSend || input;
    if (!complaint.trim() && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: complaint,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      image: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintText: complaint,
          imageBase64: userMessage.image,
          userId: "user-mechanic-local",
        }),
      });

      const data: DiagnosticResponse = await res.json();

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.analysisSummary,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        diagnosisData: data,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: "Maaf, koneksi ke modul analisa TORQ AI sedang terkendala. Coba ulangi pertanyaan Anda.",
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-100 pb-16 md:pb-0 transition-colors">
      {/* Top Chat Command Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3.5 shrink-0 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/30 font-bold">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                TORQ AI • Master Mechanic
              </h1>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Spesialis Diagnosa Mesin, Kaki-kaki & Keselamatan Otomotif
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setMessages([
              {
                id: "msg-welcome",
                sender: "bot",
                text: "Percakapan direset. Ada kendala mobil lain yang bisa TORQ AI bantu analisa?",
                timestamp: "Baru saja",
              },
            ])
          }
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Reset Sesi Chat"
        >
          <RotateCcw className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5 max-w-4xl w-full mx-auto">
        {messages.map((msg) => {
          const isBot = msg.sender === "bot";
          const diag = msg.diagnosisData;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 sm:gap-4 ${isBot ? "" : "flex-row-reverse"}`}
            >
              {/* Avatar */}
              <div
                className={`h-9 w-9 sm:h-10 sm:w-10 rounded-2xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  isBot
                    ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-800 text-white dark:bg-slate-700"
                }`}
              >
                {isBot ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>

              {/* Chat Bubble */}
              <div className="space-y-3.5 max-w-[88%] sm:max-w-[78%]">
                <div
                  className={`p-4 sm:p-5 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? "bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm shadow-sm"
                      : "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white rounded-tr-sm shadow-md shadow-blue-500/20"
                  }`}
                >
                  {/* Gambar terlampir */}
                  {msg.image && (
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-3.5 border border-white/20">
                      <Image
                        src={msg.image}
                        alt="Foto komponen mobil"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}

                  <p className="whitespace-pre-line font-medium">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-2 font-medium ${
                      isBot ? "text-slate-400" : "text-blue-100"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Card Diagnosa Ekstensif (Jika ada) */}
                {diag && (
                  <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-sm">
                    {/* Severity Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Diagnosa Spesifik TORQ AI
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black border ${
                          diag.severity === "BAHAYA"
                            ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800"
                            : diag.severity === "SEDANG"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                        }`}
                      >
                        Tingkat: {diag.severity}
                      </span>
                    </div>

                    {/* SOP Keselamatan */}
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs space-y-1">
                      <span className="font-black flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                        <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        SOP KESELAMATAN FISIK
                      </span>
                      <p className="leading-relaxed font-medium">{diag.safetyFirstNotice}</p>
                    </div>

                    {/* Langkah Periksa Mandiri */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                        Langkah Pengecekan Mandiri (DIY):
                      </h4>
                      <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                        {diag.diySteps.map((step, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700"
                          >
                            <span className="h-5 w-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed font-medium">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Rekomendasi Video YouTube */}
                    {diag.videoTutorials.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Video className="h-4 w-4 text-rose-500" />
                          Tutorial Video DIY YouTube
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {diag.videoTutorials.map((vid) => (
                            <a
                              key={vid.id}
                              href={vid.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs block transition-colors group"
                            >
                              <p className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {vid.title}
                              </p>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                                Channel: {vid.channelTitle}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suku Cadang Terkait */}
                    {diag.recommendedParts.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Estimasi Biaya Spare Part
                        </h4>
                        <div className="space-y-2">
                          {diag.recommendedParts.map((part) => (
                            <div
                              key={part.id}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                            >
                              <span className="text-slate-800 dark:text-slate-200 font-semibold">{part.title}</span>
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {part.priceFormatted}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 font-semibold text-slate-700 dark:text-slate-300">
                TORQ AI sedang menganalisa keluhan mobil...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-4 sm:px-6 py-2.5 max-w-4xl w-full mx-auto overflow-x-auto flex items-center gap-2 no-scrollbar">
        {QUICK_PROMPTS.map((promptText, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(promptText)}
            className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all shrink-0 active:scale-95 shadow-2xs cursor-pointer"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shrink-0 shadow-lg">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Image Preview if selected */}
          {selectedImage && (
            <div className="relative inline-block border-2 border-blue-600 rounded-2xl overflow-hidden shadow-sm">
              <Image
                src={selectedImage}
                alt="Preview upload"
                width={80}
                height={80}
                unoptimized
                className="object-cover h-20 w-20"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Camera / Photo Button */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[48px] min-w-[48px] rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
              title="Lampirkan Foto Kerusakan"
              aria-label="Upload Foto"
            >
              <Camera className="h-5 w-5" />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ceritakan keluhan mobil Anda (misal: getar saat ngerem, bunyi kletek di roda)..."
              className="flex-1 min-h-[48px] px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isTyping || (!input.trim() && !selectedImage)}
              className="min-h-[48px] min-w-[48px] px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
              aria-label="Kirim Pesan"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
