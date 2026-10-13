# Product Requirements Document (PRD)
## BengkelSaku: Panduan Inspeksi Mobil Bekas & Asisten Mekanik Otodidak

---

### Informasi Dokumen
- **Nama Produk:** BengkelSaku
- **Versi Dokumen:** 1.0.0
- **Status:** Approved for Implementation
- **Target Platform:** Mobile-First Web Application (PWA Ready)
- **Target Database:** PostgreSQL 18 (Localhost: `postgresql://postgres:server!2345@localhost:5432/BengkelSaku`)

---

## 1. Executive Summary & Visi Produk

### 1.1 Visi
BengkelSaku adalah asisten digital otomotif berbasis AI yang dirancang untuk memberdayakan pemilik kendaraan pemula dan mekanik otodidak di Indonesia. Platform ini menggabungkan analisis visual AI (Computer Vision LLM), sistem perawatan proaktif berbasis data odometer riil, kurasi panduan video mekanik, dan simulasi pengadaan suku cadang secara aman, terjangkau, dan anti-panik.

### 1.2 Masalah Utama (Problem Statement)
1. **Asimetri Informasi Mobil Bekas:** Calon pembeli dan pemilik mobil bekas kesulitan mendeteksi potensi kerusakan (rembes oli, keausan komponen suspensi, indikasi tabrakan) tanpa menyewa jasa inspektur mahal.
2. **Kepanikan & Ketidaktahuan Perawatan:** Pemilik mobil sering lupa jadwal servis berkala atau mudah panik ketika muncul gejala asing (bunyi decit, getaran, bau), sehingga rentan diperdaya oknum bengkel tidak jujur.
3. **Risiko Keselamatan Kerja Mandiri (DIY):** Mekanik otodidak kerap melakukan reparasi tanpa memahami SOP keselamatan fisik (misal: hanya mengandalkan dongkrak hidrolik tanpa jack stand, membuka tutup radiator panas, korsleting aki).
4. **Jargon Otomotif yang Mengintimidasi:** Istilah teknis bengkel membingungkan pengguna awam dan memicu kecemasan.

### 1.3 Solusi BengkelSaku
- **Inspeksi & Diagnosa Mandiri:** Ambil foto komponen/gejala, AI menganalisa tingkat keparahan, estimasi biaya, dan suku cadang yang dicurigai.
- **Garasi Digital Proaktif:** Memantau siklus penggantian oli mesin, oli transmisi, filter, dan kampas rem berdasarkan odometer aktual.
- **Kurasi Panduan Terintegrasi:** Menghubungkan diagnosa langsung ke video tutorial YouTube yang relevan dan pencarian spare part.
- **Safety-First Guardrails:** Standard Operating Procedure (SOP) keselamatan otomatis di setiap saran mekanik.

---

## 2. User Persona

### Persona A: Rendy (27) - Pembeli & Pemilik Mobil Bekas Pemula
- **Karakteristik:** Baru membeli mobil bekas pertamanya (Honda Brio 2017). Pengetahuan otomotif minim.
- **Kebutuhan:** Ingin tahu kapan jadwal servis berikutnya tanpa harus membuka buku manual tebal; butuh penjelasan bahasa manusia saat mobil mengeluarkan bunyi aneh.
- **Pain Point:** Takut "dikerjai" bengkel; panik jika indikator mesin menyala.

### Persona B: Bagas (34) - Antusias Otomotif / Mekanik Otodidak
- **Karakteristik:** Suka merawat dan memperbaiki mobil sendiri di akhir pekan.
- **Kebutuhan:** Panduan visual cepat, part number suku cadang yang presisi, dan referensi tutorial video tepercaya saat berada di kolong mobil.
- **Pain Point:** Tangan sering kotor/berminyak saat mengakses smartphone; butuh UI dengan tombol besar dan kontras tinggi di ruang remang.

---

## 3. Tech Stack & Infrastructure

| Layer | Teknologi | Rincian / Versi |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | v15.x / TypeScript 5.x |
| **Authentication** | Auth.js (NextAuth.js) | v5.x (Google OAuth SSO) |
| **Database** | PostgreSQL | PostgreSQL 18 Localhost |
| **Vector Engine** | `pgvector` extension | Vektor dimensi 1536/768 untuk RAG dokumen manual servis |
| **ORM** | Prisma ORM / Drizzle | Prisma Client v6.x dengan driver adapter |
| **Styling & UI** | Tailwind CSS + Shadcn/UI | Mobile-first, Dark Mode, Lucide React Icons |
| **AI Orchestration**| Vercel AI SDK (`ai`) | Provider: Gemini 1.5 Flash/Pro atau Groq (Llama 3.2 Vision) |
| **External APIs** | YouTube Data API v3 | Query video tutorial DIY |
| **E-Commerce Mock**| DummyJSON API / Custom API | Simulasi katalog pencarian suku cadang |

---

## 4. Arsitektur Sistem & Struktur Folder

```
d:/Project/BengkelSaku/
├── app/
│   ├── (auth)/
│   │   ├── signin/
│   │   └── error/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Dashboard Utama
│   │   ├── garage/
│   │   │   ├── page.tsx                  # Daftar mobil pengguna
│   │   │   └── [id]/page.tsx             # Detail mobil & riwayat log
│   │   ├── diagnose/
│   │   │   └── page.tsx                  # Vision AI Scanner & Chat
│   │   └── maintenance/
│   │       └── page.tsx                  # Kalkulator & Proactive Service Log
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── diagnose/route.ts             # AI Agent Orchestrator (Vision LLM + Tools)
│   │   ├── garage/route.ts               # CRUD Vehicle Profile
│   │   ├── maintenance/route.ts          # CRUD Service Logs & Proactive Alert
│   │   └── spareparts/route.ts           # Proxy E-Commerce API (DummyJSON)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                               # Shadcn atomic components (button, card, dialog)
│   ├── garage/
│   │   ├── VehicleDashboardCard.tsx      # Komponen kartu mobil utama
│   │   ├── AddVehicleModal.tsx
│   │   └── OdometerQuickUpdate.tsx
│   ├── diagnose/
│   │   ├── CameraCapture.tsx             # Mobile camera upload handler
│   │   ├── DiagnosticResultCard.tsx
│   │   └── SafetyWarningBanner.tsx       # Alert banner keselamatan fisik
│   └── shared/
│       ├── Header.tsx
│       └── BottomNavigation.tsx          # Mobile workshop sticky bottom bar
├── lib/
│   ├── db/
│   │   └── prisma.ts                     # Prisma client singleton
│   ├── security/
│   │   ├── sanitize.ts                   # Input validator & prompt injection barrier
│   │   ├── rate-limit.ts
│   │   └── audit-logger.ts               # OWASP ASI audit logger
│   ├── services/
│   │   ├── maintenance-calculator.ts     # calculateNextService logic
│   │   ├── youtube.ts                    # YouTube Data API client + Fallback
│   │   ├── spareparts.ts                 # DummyJSON client + Fallback
│   │   └── vision-ai.ts                  # Vercel AI SDK integration
│   └── utils/
│       └── formatters.ts                 # Odometer & currency formatters (IDR)
├── prisma/
│   └── schema.prisma                     # Skema database & index
├── types/
│   ├── automotive.ts
│   ├── maintenance.ts
│   └── agent.ts
└── .env.example
```

---

## 5. Fitur Fungsional & User Stories

### Epic 1: Otentikasi & Profil Pengguna (Auth.js v5)
- **US-01:** Sebagai pengguna, saya dapat masuk menggunakan akun Google secara sekali klik (SSO).
- **US-02:** Sistem membuat sesi aman dan mencatat identitas unik pengguna pada database PostgreSQL 18.

### Epic 2: Manajemen Garasi Mobil (Digital Garage)
- **US-03:** Pengguna dapat mendaftarkan kendaraan: Merek, Model, Tahun Pembuatan, Nomor Polisi / VIN, Odometer Terkini (km), Tanggal Servis Terakhir, dan Foto Kendaraan.
- **US-04:** Pengguna dapat memperbarui angka odometer dalam 2 ketukan layar (Quick Odometer Update) dari dashboard.

### Epic 3: Proactive Maintenance System (Algoritma Servis Berkala)
- **US-05:** Sistem menghitung sisa masa pakai oli mesin, oli transmisi, filter udara, busi, dan kampas rem berdasarkan delta odometer dan interval waktu (bulan).
- **US-06:** Dashboard menampilkan status berkode warna:
  - **Hijau (Aman):** Interval > 1.500 km atau > 30 hari.
  - **Kuning (Segera Siapkan):** Interval sisa 500 - 1.500 km atau sisa 7 - 30 hari.
  - **Merah (Waktunya Ganti):** Interval terlewati atau sisa < 500 km.
- **US-07:** Setiap notifikasi servis disertai perkiraan biaya standar pasar Indonesia dan tingkat urgensi teknis.

### Epic 4: AI Agent Diagnosa Kerusakan (Vision LLM Multi-Tool)
- **US-08:** Pengguna dapat mengunggah foto komponen bermasalah (misal: kebocoran oli kolong, keausan ban tidak merata, permukaan cakram bergelombang) dan mengetik keluhan gejala.
- **US-09:** Backend Route Handler mengorkestrasi alur:
  1. Sanitasi input (OWASP ASI-01).
  2. Eksekusi Vision LLM dengan System Prompt Mekanik Ahli.
  3. LLM memanggil Tool YouTube API untuk mencari 2 video tutorial DIY terbaik.
  4. LLM memanggil Tool Suku Cadang (DummyJSON) untuk simulasi estimasi harga part.
  5. Format output: Deskripsi Analisa Awam $\rightarrow$ Tingkat Bahaya $\rightarrow$ Panduan DIY Langkah-demi-Langkah $\rightarrow$ Peringatan Safety First.
- **US-10:** Jika API Key kosong atau limit habis, sistem mengembalikan Mock Diagnostic Data tanpa membuat aplikasi crash (Zero-Config Fallback).

---

## 6. Standar Kualitas, Ergonomi & Design System

### 6.1 Ergonomi Bengkel (Mobile-First UI/UX Promax)
- **Touch Target Threshold:** Semua elemen interaktif (tombol, input radio, tab selector) memiliki dimensi minimal `48px x 48px` dan jarak antar tombol minimal `12px` untuk memudahkan penekanan saat pengguna mengenakan sarung tangan kerja atau tangan kotor.
- **Lighting Adaptation (High-Contrast Dark Mode):** 
  - Dark mode bukan sekadar estetika, melainkan kebutuhan fungsional saat pengguna bekerja di area redup (bawah kap mesin atau kolong mobil).
  - Kontras rasio teks minimal `7:1` (WCAG AAA) pada elemen krusial dan indikator bahaya.
  - Warna status:
    - Danger/Stop: `#EF4444` (Red-500)
    - Warning/Caution: `#F59E0B` (Amber-500)
    - Safe/OK: `#10B981` (Emerald-500)
    - Primary Brand: `#2563EB` (Blue-600) / `#F97316` (Mechanic Orange-500)

### 6.2 UX Writing, Copywriting & Safety First Guidelines
- **Voice & Tone:** 
  - *Calm, Confident, Empathetic, Non-Judgemental*. Tidak membuat pengguna merasa bersalah jika mobilnya terlanjur rusak.
  - Menghilangkan jargon membingungkan:
    - *Viskositas oli 10W-40* $\rightarrow$ "Tingkat kekentalan oli standar untuk mesin tahun 2015 ke atas."
    - *Bushing arm aus* $\rightarrow$ "Karet peredam bantalan roda sudah getas/retak, memicu bunyi 'gluduk' di jalan keriting."
- **Safety First Box Component:** Setiap saran perbaikan wajib memuat disclaimer visual sebelum langkah teknis:
  > **PENTING UNTUK KESELAMATAN ANDA**
  > Jangan pernah masuk ke bawah mobil yang HANYA ditopang dongkrak hidrolik. Selalu pasang **Jack Stand** pada titik tumpu sasis resmi dan ganjal roda belakang sebelum bekerja.

---

## 7. Spesifikasi Keamanan AI Agent (OWASP ASI Compliance Matrix)

| Kode ASI | Nama Risiko | Implementasi di BengkelSaku |
| :--- | :--- | :--- |
| **ASI-01** | Prompt Injection Protection | Sanitasi string keluhan user; tolak prompt yang mengandung instruksi manipulasi sistem ("ignore previous instructions", jailbreak). Pengecekan ukuran dan format MIME foto sebelum ke LLM. |
| **ASI-02** | Insecure Tool Use | Tool parameter allowlisting. Parameter query YouTube API dibatasi hanya kata kunci otomotif + merek mobil; API suku cadang dibatasi kategori `automotive-parts`. Tidak ada eksekusi shell/eval. |
| **ASI-03** | Excessive Agency | Agen AI hanya bersifat *advisory*. AI tidak memiliki izin melakukan transaksi finansial, modifikasi database core tanpa konfirmasi pengguna, atau menghapus riwayat mobil. |
| **ASI-06** | Insufficient Logging | Seluruh input diagnosa, raw query tool, durasi inferensi, dan rekomendasi AI dicatat ke tabel `DiagnosticAuditLog` untuk audit akuntabilitas. |
| **ASI-08** | Policy Bypass & Safety Guardrails | Sistem deterministik membatalkan saran jika menyangkut komponen berisiko fatal tanpa keahlian khusus (misal: perbaikan modul airbag SRS, sistem rem ABS kompleks, kompresor AC bertekanan tinggi). AI otomatis mengarahkan ke bengkel resmi profesional. |

---

## 8. Arsitektur Database & Optimasi SQL (PostgreSQL 18)

### 8.1 Strategi Optimasi SQL & Indexing
1. **Composite B-Tree Indexes:**
   - Pencarian riwayat log servis sering menyaring berdasarkan `vehicleId` yang diurutkan tanggal descending:
     `CREATE INDEX idx_maintenance_vehicle_date ON "MaintenanceLog"("vehicleId", "serviceDate" DESC);`
   - Filter pemantauan odometer:
     `CREATE INDEX idx_vehicle_user_odometer ON "VehicleProfile"("userId", "currentOdometer");`
2. **Vector Search Optimization (`pgvector`):**
   - Menggunakan indeks `HNSW` (Hierarchical Navigable Small World) pada kolom embedding manual kendaraan untuk query RAG yang responsif:
     `CREATE INDEX idx_document_embeddings_hnsw ON "DocumentEmbedding" USING hnsw ("embedding" vector_cosine_ops);`
3. **Cursor-Based Pagination:**
   - Riwayat perbaikan dan log inspeksi menggunakan ID / `createdAt` cursor pagination untuk mencegah latensi tinggi pada `OFFSET`.
4. **Anti N+1 & Query Hygiene:**
   - Semua pemanggilan relasi pada Prisma ORM menggunakan `include` selektif dengan `select` kolom spesifik (tidak melakukan `SELECT *`).

### 8.2 Entity-Relationship & Prisma Schema

```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

model User {
  id            String           @id @default(cuid())
  name          String?
  email         String?          @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  vehicles      VehicleProfile[]
  auditLogs     DiagnosticAuditLog[]
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VehicleProfile {
  id              String           @id @default(cuid())
  userId          String
  make            String           // e.g. "Toyota"
  model           String           // e.g. "Avanza Veloz"
  year            Int              // e.g. 2019
  licensePlate    String?          // e.g. "B 1234 CD"
  vin             String?
  currentOdometer Int              @default(0) // in KM
  lastServiceDate DateTime?
  imageUrl        String?
  maintenanceLogs MaintenanceLog[]
  repairLogs      RepairLog[]
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([userId, currentOdometer])
}

model MaintenanceLog {
  id             String         @id @default(cuid())
  vehicleId      String
  serviceType    String         // e.g. "GANTI_OLI_MESIN", "KAMPAS_REM", "FILTER_UDARA"
  odometerAt     Int            // Odometer saat pengerjaan
  serviceDate    DateTime       @default(now())
  cost           Decimal?       @db.Decimal(12, 2)
  workshopName   String?
  notes          String?        @db.Text
  vehicle        VehicleProfile @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  createdAt      DateTime       @default(now())

  @@index([vehicleId, serviceDate(sort: Desc)])
}

model RepairLog {
  id             String         @id @default(cuid())
  vehicleId      String
  complaint      String         @db.Text
  aiDiagnosis    String         @db.Text
  partsReplaced  String?        @db.Text
  totalCost      Decimal?       @db.Decimal(12, 2)
  isResolved     Boolean        @default(false)
  vehicle        VehicleProfile @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  createdAt      DateTime       @default(now())

  @@index([vehicleId, createdAt(sort: Desc)])
}

model DocumentEmbedding {
  id         String                 @id @default(cuid())
  category   String                 // e.g. "MANUAL_BENGKEL", "GEJALA_RUSAK"
  title      String
  content    String                 @db.Text
  embedding  Unsupported("vector")? // pgvector embedding
  createdAt  DateTime               @default(now())
}

model DiagnosticAuditLog {
  id           String   @id @default(cuid())
  userId       String?
  rawComplaint String   @db.Text
  detectedRisk String   // e.g. "LOW", "MODERATE", "CRITICAL_SAFETY"
  toolsTriggered String[]
  modelUsed    String
  ipAddress    String?
  user         User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  createdAt    DateTime @default(now())

  @@index([userId, createdAt])
}
```

---

## 9. Spesifikasi Logika Maintenance (calculateNextService)

Algoritma menentukan kebutuhan perawatan berkala mobil bensin/diesel standar di Indonesia:

```typescript
export interface ServiceItemSchedule {
  name: string;
  category: "OLI_MESIN" | "OLI_TRANSMISI" | "FILTER_UDARA" | "KAMPAS_REM" | "BUSI";
  intervalKm: number;
  intervalMonths: number;
  estimatedCostRange: string;
  urgency: "SAFE" | "UPCOMING" | "OVERDUE";
  friendlyMessage: string;
  safetyTip: string;
}
```

**Kaidah Interval Standar:**
1. **Oli Mesin:** 10.000 km atau 6 bulan (Full Synthetic) / 5.000 km (Semi Synthetic).
2. **Filter Oli:** Bersamaan dengan setiap 1-2 kali penggantian oli mesin.
3. **Oli Transmisi (Matic/Manual):** 40.000 km atau 24 bulan.
4. **Kampas Rem Depan:** Inspeksi tiap 20.000 km, ganti jika ketebalan < 3mm.
5. **Filter Udara & AC:** Tiap 15.000 - 20.000 km.

---

## 10. Konfigurasi Lingkungan (.env.example)

```env
# ==============================================================================
# BENGKELSAKU ENVIRONMENT VARIABLES
# ==============================================================================

# NEXTAUTH (AUTH.JS v5)
# Generate secret using: npx auth secret
AUTH_SECRET="your-super-secret-auth-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# GOOGLE OAUTH SSO
# Buat project di Google Cloud Console: https://console.cloud.google.com/apis/credentials
AUTH_GOOGLE_ID="your-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# DATABASE (POSTGRESQL 18 LOCALHOST)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:server!2345@localhost:5432/BengkelSaku?schema=public"

# AI ENGINE (VERCEL AI SDK)
# Pilih salah satu atau sediakan fallback:
# Gemini API: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=""
# Groq API: https://console.groq.com/keys
GROQ_API_KEY=""

# EXTERNAL DATA APIS
# YouTube Data API v3: https://console.cloud.google.com/apis/library/youtube.googleapis.com
YOUTUBE_API_KEY=""

# APP ENVIRONMENT
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 11. Roadmap Eksekusi & Tahapan Rilis (MVP)

### Fase 1: Core Foundation & Database (Sprint 1)
- [x] Inisialisasi Next.js 15 App Router & Tailwind CSS.
- [ ] Setup Prisma ORM terhubung ke PostgreSQL 18 Localhost.
- [ ] Migrasi tabel Auth.js, VehicleProfile, MaintenanceLog, DocumentEmbedding (pgvector).
- [ ] Setup Auth.js v5 Google SSO dengan Fallback Mock Session untuk offline testing.

### Fase 2: Garage & Proactive Maintenance Engine (Sprint 2)
- [ ] Implementasi CRUD Garasi Mobil (Merek, Model, Odometer).
- [ ] Implementasi modul `calculateNextService.ts`.
- [ ] Pembuatan komponen UI `VehicleDashboardCard.tsx` dengan status ergonomis 48px.

### Fase 3: AI Diagnostic Agent & External Integration (Sprint 3)
- [ ] Endpoint `/api/diagnose` orkestrasi Vercel AI SDK (Vision LLM).
- [ ] Integrasi YouTube API client dengan caching & fallback response.
- [ ] Integrasi katalog DummyJSON dengan modul estimasi suku cadang.
- [ ] Audit log OWASP ASI dan filter sanitasi prompt injection.

### Fase 4: Testing, Security Audit & Polishing (Sprint 4)
- [ ] Verifikasi kepatuhan OWASP ASI Top 10 via audit script.
- [ ] Verifikasi performa query PostgreSQL (EXPLAIN ANALYZE) pada index composite.
- [ ] Uji coba aksesibilitas mobile WCAG di kondisi minim cahaya (Dark Mode Test).
