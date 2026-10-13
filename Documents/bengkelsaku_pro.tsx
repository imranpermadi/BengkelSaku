import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Car, Search, Settings, ArrowRight, CheckCircle2, 
  AlertTriangle, Bot, Camera, PlayCircle, Wrench, LayoutDashboard,
  Moon, Sun, ExternalLink, Activity, History, FileText, ShoppingCart,
  Star, Shield, Zap, ChevronRight, Check
} from 'lucide-react';

const diagnosticSymptoms = [
  {
    id: 'symptom-1',
    label: 'Mesin brebet & ndut-ndutan saat AC menyala',
    result: 'Busi Iridium & Koil Pengapian (Ignition Coil)',
    urgency: 'PERIKSA',
    urgencyColor: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
    icon: <AlertTriangle className="w-4 h-4" />,
    desc: 'Beban kompresor AC membutuhkan daya torsi lebih besar saat idle. Jika elektroda busi sudah renggang atau isolator koil bocor, pengapian silinder drop dan mesin terasa pincang (misfire).',
    price: 'Rp 350.000 - Rp 650.000 (Set Busi + Cek Koil)',
    diy: 'Periksa celah gap busi dengan feeler gauge (standar 1.0 - 1.1 mm) sebelum memutuskan mengganti koil.'
  },
  {
    id: 'symptom-2',
    label: 'Bunyi dengung di kolong roda saat 60 km/jam',
    result: 'Bearing Roda Depan (Wheel Bearing)',
    urgency: 'AWAS BAHAYA',
    urgencyColor: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    icon: <AlertTriangle className="w-4 h-4" />,
    desc: 'Bunyi dengung yang seiring dengan putaran roda biasanya mengindikasikan pelor bearing sudah aus. Sangat berbahaya jika digunakan di kecepatan tinggi karena roda bisa macet.',
    price: 'Rp 450.000 - Rp 850.000',
    diy: 'Dongkrak ban yang dicurigai, pegang per keong (spring), lalu putar ban. Jika per terasa bergetar kasar, bearing positif rusak.'
  },
  {
    id: 'symptom-3',
    label: 'AC keluar angin tapi tidak dingin saat macet',
    result: 'Extra Fan Mati / Kompresi Lemah',
    urgency: 'WASPADA OVERHEAT',
    urgencyColor: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
    icon: <AlertTriangle className="w-4 h-4" />,
    desc: 'Saat mobil diam, kondensor AC tidak mendapat hembusan angin dari depan. Jika extra fan mati, suhu freon gagal didinginkan dan tekanan naik (overheat kompresor).',
    price: 'Rp 250.000 - Rp 1.500.000',
    diy: 'Nyalakan mesin dan AC. Buka kap mesin, periksa apakah kipas radiator / extra fan berputar kencang. Jika mati, cek relay fan.'
  }
];

const checklistInspeksi = [
  { id: 1, title: 'Mesin kering halus no rembes', tip: 'Periksa paking tutup klep dan carter oli bawah, raba dengan tisu putih.' },
  { id: 2, title: 'AC dingin menggigil', tip: 'Nyalakan AC posisi 2 saat idle, pastikan RPM mesin stabil dan ekstra fan berputar kencang.' },
  { id: 3, title: 'Kaki-kaki senyap siap luar kota', tip: 'Uji jalan belok patah di jalan paving block, dengarkan apakah ada bunyi klotok-klotok CV joint.' },
  { id: 4, title: 'Surat lengkap BPKB STNK faktur hidup', tip: 'Cocokkan nomor rangka di bodi dan nomor mesin di blok silinder dengan BPKB asli.' },
];

const spareParts = [
  { id: 1, name: 'Filter Oli Mesin Genuine Hyundai Mobis (Atoz / Visto)', category: 'Filter', fit: 'Hyundai Atoz 1.0 / 1.1, Kia Visto', price: 'Rp 38.000', note: 'Wajib ganti tiap 5.000 KM bersamaan oli mesin baru', rating: 4.9 },
  { id: 2, name: 'Ball Joint Bawah Kiri & Kanan (555 Japan / Mobis)', category: 'Kaki-Kaki', fit: 'Hyundai Atoz 2000-2008, Kia Visto', price: 'Rp 175.000', note: 'Solusi bunyi jedug saat belok atau jalan berlubang', rating: 4.9 },
  { id: 3, name: 'Karet Boot Steering Rack Steer Kiri / Kanan', category: 'Kaki-Kaki', fit: 'Hyundai Atoz Manual / Matic', price: 'Rp 45.000', note: 'Mencegah pasir dan air masuk merusak gigi pinion steer', rating: 4.8 },
  { id: 4, name: 'Kampas Rem Depan Bendix GCT Titanium (Hyundai Atoz)', category: 'Pengereman', fit: 'Hyundai Atoz, Kia Visto, Kia Picanto Gen 1', price: 'Rp 185.000', note: 'Pakem tanpa bunyi decit, tidak merusak piringan cakram', rating: 4.9 },
  { id: 5, name: 'Timing Belt Kit + Tensioner Bearing Gates / Mobis', category: 'Mesin', fit: 'Hyundai Atoz 1.0cc & 1.1cc', price: 'Rp 245.000', note: 'Ganti tiap 50.000 KM agar klep tidak bertabrakan dengan piston', rating: 5.0 },
  { id: 6, name: 'Busi NGK BPR5EY-11 Standard Copper (1 Set 4 Pcs)', category: 'Pengapian', fit: 'Hyundai Atoz 1.0, Suzuki Karimun Kotak', price: 'Rp 90.000', note: 'Tarikan enteng, irit bensin, dan stasioner tidak pincang', rating: 4.9 },
];

const DashboardView = () => {
  const [activeSymptom, setActiveSymptom] = useState(diagnosticSymptoms[0]);
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center mt-10 mb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 text-xs font-bold mb-8 uppercase tracking-widest shadow-sm">
          <Wrench className="w-3.5 h-3.5" /> Platform Otomotif Berbasis AI No.1 Di Indonesia
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mb-6">
          <span className="block">Perawatan Mobil <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Lebih Cerdas,</span></span>
          <span className="block">Bebas Boncos, & Terpantau AI.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed font-medium">
          Solusi all-in-one bagi pemilik mobil: diagnosa keluhan teknis mesin dengan AI cerdas, kompresi buku manual tebal menjadi profil AI instan, visualisasikan komponen dalam <strong className="text-slate-900 dark:text-white font-bold">Augmented Reality (AR 3D)</strong>, dan inspeksi mobil bekas.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            Mulai Sekarang (Gratis dengan Google) <ArrowRight className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
            Masuk Email
          </button>
        </div>
      </section>

      {/* Diagnostic Section */}
      <section className="max-w-5xl mx-auto mb-24 relative">
        <div className="text-center mb-10">
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2"><Bot className="w-4 h-4"/> Coba Fitur Diagnosa Otomatis Tanpa Login</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Punya Masalah dengan Mobil Anda?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">Klik keluhan umum di bawah ini untuk melihat bagaimana TORQ AI mendiagnosa komponen, menilai risiko keselamatan, dan mengestimasi biaya perbaikan:</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            {diagnosticSymptoms.map((symp) => (
              <button key={symp.id} onClick={() => setActiveSymptom(symp)} 
                className={`px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${activeSymptom.id === symp.id ? 'bg-blue-600 text-white shadow-blue-600/30 ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>
                {symp.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeSymptom.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 relative">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider mb-2 uppercase">Hasil Analisis Diagnostik AI</div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">{activeSymptom.result}</h3>
                </div>
                <div className={`px-4 py-2 rounded-xl border text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shadow-sm ${activeSymptom.urgencyColor}`}>
                  {activeSymptom.icon} Tingkat Urgensi: {activeSymptom.urgency}
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed mb-8 font-medium">{activeSymptom.desc}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold">Estimasi Biaya Suku Cadang & Pasang:</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{activeSymptom.price}</div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold">Tips Pengecekan Mandiri (DIY):</div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{activeSymptom.diy}</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6 gap-4">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium text-center sm:text-left">Ingin konsultasi keluhan spesifik mobil Anda? Tanya robot TORQ AI langsung!</span>
                <button className="w-full sm:w-auto px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                   Konsultasikan Masalah Mobil Saya Sekarang
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="mb-20">
         <div className="text-center mb-12">
            <h2 className="text-xs font-black text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-2">Ekosistem Lengkap Pemilik Mobil</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">Fitur Canggih yang Bisa Anda Nikmati</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: <Wrench/>, title: 'Garasi Digital Berbasis AI', desc: 'Kompresi buku panduan pabrikan ke AI, rekam kilometer harian, dan pantau indeks kesiapan unit.', link: 'Buka Garasi' },
              { icon: <ShieldCheck/>, title: 'Inspeksi FB & OLX Scraper', desc: 'Tarik otomatis foto dan klaim penjual dari link marketplace. Bawa checklist 20 titik saat COD di TKP.', link: 'Cek Inspeksi' },
              { icon: <Camera/>, title: 'Visual AR Foto Mesin Aktual', desc: 'Unggah foto fisik mesin Anda. Tunjuk kabel atau sensor misterius dan AI langsung memberi tahu fungsinya.', link: 'Coba Visual AR' },
              { icon: <History/>, title: 'Buku Servis & Biaya', desc: 'Catat pergantian oli, riwayat bengkel, dan miliki sertifikat perawatan yang menaikkan harga jual mobil.', link: 'Buka Catatan Servis' }
            ].map((feat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-blue-900/10 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">{feat.icon}</div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feat.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{feat.desc}</p>
                </div>
                <div className="mt-8 flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:gap-1.5 transition-all">
                  {feat.link} <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
         </div>
      </section>
    </motion.div>
  );
};

const GarasiView = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 text-xs font-bold mb-4 uppercase tracking-widest shadow-sm"><Star className="w-3.5 h-3.5" /> Fitur Eksklusif BengkelSaku</div>
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
        Ubah Mobil Anda Menjadi <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">Garasi Pintar Berbasis AI</span>
      </h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium text-lg">Tinggalkan buku manual tebal 400 halaman di laci. Daftarkan mobil Anda di BengkelSaku, unggah buku panduan (PDF), dan biarkan AI merangkum seluruh spesifikasi resmi: viskositas oli, torsi baut, kapasitas cairan, dan visualisasi komponen mesin secara <strong className="text-slate-900 dark:text-white">Augmented Reality (AR 3D)</strong>.</p>
    </div>

    {/* Car Profile Interactive Card */}
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 lg:p-8 mb-12 shadow-xl shadow-slate-200/50 dark:shadow-none">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
           <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-widest uppercase mb-1 flex items-center gap-2"><Activity className="w-4 h-4"/> Uji Coba Interaktif Tanpa Login</div>
           <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Lihat Bagaimana Garasi Anda Bekerja</h3>
        </div>
        <div className="flex gap-2">
          <button className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md">Toyota Avanza</button>
          <button className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Honda Brio</button>
          <button className="hidden sm:block px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Hyundai Atoz</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Car Image Area */}
        <div className="lg:w-1/3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 relative overflow-hidden group min-h-[300px]">
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-slate-900 text-white px-2 py-1 rounded-md text-xs font-black shadow-md">B 1945 TKO</span>
            <span className="bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30 px-2 py-1 rounded-md text-xs font-bold shadow-sm">Indeks Kesiapan: 94%</span>
          </div>
          <Car className="w-32 h-32 text-slate-300 dark:text-slate-800 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-4 left-4">
            <div className="text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-1 uppercase tracking-widest">TAHUN 2021</div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">Toyota Avanza Veloz 1.5 AT</div>
          </div>
        </div>

        {/* Telemetry & Stats Area */}
        <div className="lg:w-2/3 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="text-slate-500 dark:text-slate-400 text-xs mb-2 flex items-center gap-1.5 font-semibold"><LayoutDashboard className="w-4 h-4 text-blue-500"/> Odometer</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">42.500 KM</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="text-slate-500 dark:text-slate-400 text-xs mb-2 flex items-center gap-1.5 font-semibold"><History className="w-4 h-4 text-blue-500"/> Servis Terdekat</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Ganti Oli Mesin & Filter...</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-5 shadow-sm">
              <div className="text-green-700 dark:text-green-400 text-xs mb-2 flex items-center gap-1.5 font-semibold"><Activity className="w-4 h-4"/> Status Mesin</div>
              <div className="text-base font-bold text-green-700 dark:text-green-400">Normal & Terkalibrasi</div>
            </div>
          </div>
          
          <div className="flex-1 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold"><FileText className="w-5 h-5" /> Rujukan Buku Manual Resmi (Ekstrak AI):</div>
               <span className="text-[10px] uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 px-2 py-1 rounded-md dark:text-indigo-300 font-bold tracking-wider border border-indigo-200 dark:border-indigo-500/30">Otomatis dari PDF</span>
             </div>
             <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
               Oli SAE 0W-20 (3.3L) • Timing Chain Bebas Rawat • Busi Iridium FK20HR11 • Transmisi ATF WS • Ban 185/65 R15 (33/36 PSI)
             </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
             <button className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2">
               <Camera className="w-5 h-5 text-indigo-500"/> Uji Coba Visual AR 3D Mobil Ini
             </button>
             <button className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
               <Wrench className="w-5 h-5"/> Daftarkan Mobil Saya Sendiri
             </button>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const InspeksiView = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 text-xs font-bold mb-4 uppercase tracking-widest shadow-sm"><Search className="w-3.5 h-3.5" /> Inspektur Mobil Bekas Digital & AI Scraper</div>
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
        Beli Mobil Bekas <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-400">Tanpa Takut Kena Tipu.</span> Validasi Iklan & Cek di TKP ala Profesional!
      </h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium text-lg">Cukup salin link iklan dari <strong className="text-slate-900 dark:text-white">Facebook Marketplace</strong> atau <strong className="text-slate-900 dark:text-white">OLX</strong>, tempel ke BengkelSaku, dan sistem otomatis mengekstrak foto, spesifikasi, dan klaim penjual. Bawa checklist digital 20 titik inspeksi ke lokasi untuk mendeteksi bekas tabrak, banjir, dan trik montir nakal secara langsung.</p>
    </div>

    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
           <div className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-1 flex items-center gap-2"><Search className="w-4 h-4"/> Demo Interaktif Scraper Iklan</div>
           <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Cara Kerja AI Scraper Iklan Mobil</h3>
           <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-medium">Pilih contoh iklan di bawah ini untuk melihat bagaimana sistem otomatis mengekstrak foto, klaim penjual, dan menyusun panduan inspeksi di tempat:</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md">Hyundai Atoz</button>
          <button className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Toyota Avanza</button>
        </div>
      </div>

      {/* Mock URL Input */}
      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-8 shadow-inner">
        <ExternalLink className="w-5 h-5 text-slate-400 shrink-0" />
        <div className="flex-1 text-slate-600 dark:text-slate-400 text-sm font-mono truncate">https://www.facebook.com/marketplace/item/966987856212792/</div>
        <div className="hidden sm:flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0">
          <CheckCircle2 className="w-4 h-4" /> Data Berhasil Diekstrak AI
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Ad Image / Info */}
        <div className="lg:w-1/3 flex flex-col gap-4">
           <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 relative overflow-hidden group">
              <div className="absolute top-3 left-3 bg-blue-600 px-3 py-1 rounded-md text-xs font-bold text-white shadow-md z-10">Facebook Marketplace</div>
              {/* Dummy red car representation */}
              <div className="w-full h-full bg-red-600/10 dark:bg-red-500/20 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                 <Car className="w-24 h-24 text-red-500/50" />
              </div>
           </div>
           <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">Harga Iklan Penjual:</div>
             <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">Rp 38.000.000</div>
             <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Hyundai Atoz 1.0 GLS Manual 2002 Orisinil</div>
           </div>
        </div>

        {/* AI Checklist */}
        <div className="lg:w-2/3">
           <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-2 uppercase tracking-wider text-sm">
             ANALISIS KLAIM PENJUAL OLEH AI:
           </div>
           <p className="text-slate-900 dark:text-white font-extrabold text-xl mb-6">Panduan Validasi Fisik Saat Bertemu Penjual di TKP</p>
           
           <div className="space-y-4">
             {checklistInspeksi.map((item) => (
               <div key={item.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex gap-4 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors shadow-sm">
                  <div className="mt-1"><div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center"></div></div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <span className="font-extrabold text-slate-900 dark:text-white text-base">"{item.title}"</span>
                      <span className="text-[10px] bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30 px-2.5 py-1 rounded-md border uppercase font-black self-start sm:self-auto tracking-wider">Wajib Cek Fisik</span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 flex gap-2 items-start font-medium bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <Zap className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span><strong className="text-slate-800 dark:text-slate-200 font-bold">Tips BengkelSaku:</strong> {item.tip}</span>
                    </div>
                  </div>
               </div>
             ))}
           </div>
           
           <div className="mt-6 text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">Tersedia 20 titik inspeksi lengkap (Mesin, Kaki, Bodi, Dokumen).</div>
           <button className="w-full sm:w-auto py-4 px-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 shadow-sm">
             <PlayCircle className="w-5 h-5" /> Daftar & Jalankan Inspeksi Lengkap
           </button>
        </div>
      </div>
    </div>
  </motion.div>
);

const SukuCadangView = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20 text-xs font-bold mb-4 uppercase tracking-widest shadow-sm"><ShoppingCart className="w-3.5 h-3.5" /> Katalog Suku Cadang Terkurasi</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">Suku cadang terverifikasi OEM & aftermarket berkualitas untuk mobil Anda dengan direct search Tokopedia & Shopee.</h1>
      </div>
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm shrink-0">
        <Car className="w-6 h-6 text-slate-400" />
        <div className="text-sm">
           <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Prioritas Mobil Garasi:</div>
           <div className="font-extrabold text-slate-900 dark:text-white">Hyundai Atoz Manual (2002)</div>
        </div>
      </div>
    </div>

    {/* Hero Banner Feature */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 mb-10 shadow-xl shadow-blue-600/20">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/20 text-white text-[10px] font-black uppercase tracking-wider mb-4 border border-white/30"><Settings className="w-3 h-3"/> Fitur AI Part-Matching</div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Pusing Cari Sparepart yang 100% Cocok (Plug & Play)?</h2>
        <p className="text-blue-100 font-medium leading-relaxed">Daftarkan mobil Anda di Garasi BengkelSaku. Sistem dan AI kami akan langsung memfilter ribuan komponen dan merekomendasikan part OEM/aftermarket yang dijamin pas dengan nomor seri, tipe, dan tahun mobil Anda!</p>
      </div>
      <button className="whitespace-nowrap px-8 py-4 bg-white text-blue-600 font-extrabold rounded-2xl shadow-lg hover:scale-105 transition-transform">
        Daftar Gratis dengan Google
      </button>
    </div>

    {/* Search & Filters */}
    <div className="mb-10">
       <div className="relative mb-6">
         <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
         <input type="text" placeholder="Cari suku cadang (contoh: kampas rem, filter oli, balljoint Atoz Manual)..." 
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all font-medium placeholder:text-slate-400" />
       </div>
       <div className="flex flex-wrap gap-2">
         {['SEMUA', 'Kaki-Kaki', 'Filter', 'Pengereman', 'Pelumas', 'Mesin', 'Pengapian'].map((pill, i) => (
           <button key={i} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${i === 0 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
             {pill}
           </button>
         ))}
       </div>
    </div>

    {/* Products Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {spareParts.map((item) => (
        <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] overflow-hidden hover:border-blue-400 dark:hover:border-blue-500/50 transition-colors group flex flex-col shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none">
          {/* Image Placeholder */}
          <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center relative p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="absolute top-4 left-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-extrabold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm">{item.category}</div>
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-black text-amber-400 border border-slate-700 dark:border-slate-800 shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> {item.rating}
            </div>
            <Settings className="w-20 h-20 text-slate-300 dark:text-slate-800 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
          </div>
          
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-500/10 px-2.5 py-1 rounded-md w-fit mb-4 uppercase border border-orange-200 dark:border-orange-500/20 tracking-wider">
              <Check className="w-3 h-3" /> Cocok: Atoz Manual
            </div>
            
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-snug mb-3 flex-1">{item.name}</h3>
            
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-4 flex items-start gap-2 font-medium bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
               <Shield className="w-4 h-4 shrink-0 text-slate-400" /> 
               <span><strong className="text-slate-700 dark:text-slate-300">Kesesuaian:</strong> {item.fit}</span>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 mb-6 text-xs font-semibold text-amber-800 dark:text-amber-400 flex items-start gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" /> {item.note}
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="text-2xl font-black text-green-600 dark:text-green-400">{item.price}</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Ready Stock</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button className="py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-white hover:bg-[#00AA5B] hover:text-white hover:border-[#00AA5B] transition-colors flex justify-center items-center gap-2 shadow-sm">
                Tokopedia <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button className="py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-white hover:bg-[#EE4D2D] hover:text-white hover:border-[#EE4D2D] transition-colors flex justify-center items-center gap-2 shadow-sm">
                Shopee <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export default function BengkelSakuApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');

  // Toggle theme handler
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'garasi', label: 'Garasi', icon: <Car className="w-4 h-4" /> },
    { id: 'inspeksi', label: 'Inspeksi Mobil', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'sukucadang', label: 'Suku Cadang', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} transition-colors duration-300`}>
      <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 font-sans selection:bg-blue-200 selection:text-blue-900 dark:selection:bg-blue-500/30 transition-colors duration-300">
        
        {/* Background Ambient Glows */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
          <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 shadow-sm dark:shadow-none">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:flex text-xl font-extrabold text-slate-900 dark:text-white tracking-tight items-baseline">
                BengkelSaku <span className="ml-1 px-1.5 py-0.5 text-[10px] font-black bg-slate-900 text-white dark:bg-white dark:text-black rounded-md">PRO</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button className="hidden lg:block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-2">Masuk</button>
              <button className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all">
                Daftar Gratis
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content Area with Framer Motion Transitions */}
        <main className="relative z-10 min-h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardView key="dashboard" />}
            {activeTab === 'garasi' && <GarasiView key="garasi" />}
            {activeTab === 'inspeksi' && <InspeksiView key="inspeksi" />}
            {activeTab === 'sukucadang' && <SukuCadangView key="sukucadang" />}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-10 relative z-10 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              <span className="font-extrabold text-slate-900 dark:text-white text-lg">BengkelSaku</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">© 2026 BengkelSaku PRO. Asisten Mekanik & Inspeksi Mobil.</p>
          </div>
        </footer>
        
      </div>
    </div>
  );
}