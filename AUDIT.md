# Nyatet — Audit Fitur
> Audit dilakukan via code review pada App.jsx (1779 baris) + vite.config.js
> Tanggal: 2026-06-06

---

## Hasil Checklist

| # | Fitur | Status | Catatan |
|---|-------|--------|---------|
| 1 | Buat catatan teks baru | ✅ Berfungsi | FAB → "Teks biasa" → EditorCatatan |
| 2 | Buat catatan ceklis baru | ✅ Berfungsi | FAB → "Daftar ceklis" → EditorCatatan |
| 3 | Counter dzikir muncul di item dengan × | ✅ Berfungsi | `parseTarget()` deteksi `(\d+)\s*[×x]` → tampilkan `[count/target]` + tombol TAP |
| 4 | Tap counter naik +1 | ✅ Berfungsi | `tapCounter()` increment counter per item |
| 5 | Counter selesai → auto centang | ✅ Berfungsi | `next >= target` → `cek:true` + vibrate + tone AudioContext |
| 6 | Tab 📿 Dzikir muncul di bottom nav | ✅ Berfungsi | Tab ke-3 di bottom nav, key `"dzikir"` |
| 7 | Halaman dzikir tampil waktu realtime | ✅ Berfungsi | `setInterval` 60 detik, jam diperbarui + deteksi waktu pagi/petang/malam |
| 8 | Template dzikir pagi tersedia | ✅ Berfungsi | 18 item sesuai sunnah — almanhaj.or.id + rumaysho.com |
| 9 | Template dzikir petang tersedia | ✅ Berfungsi | 17 item, dibedakan dari pagi (Amsaynaa, perlindungan petang) |
| 10 | Mood tag bisa dipilih | ✅ Berfungsi | `PilihMood` di EditorCatatan, 8 kategori |
| 11 | Filter by mood berfungsi | ✅ Berfungsi | `FilterBar` filter `mood_[id]`, `tipe_ceklis`, `pin` |
| 12 | Dashboard harian muncul | ✅ Berfungsi | `DashboardHarian` muncul saat tampilan=catatan & filter=semua & tanpa query |
| 13 | Pengingat bisa diset | ✅ Berfungsi | `datetime-local` input → `jadwalkanNotif()` via setTimeout |
| 14 | PIN bisa dibuat | ✅ Berfungsi | `ModalPin` 4-digit, konfirmasi ulang, simpan di settings |
| 15 | Ekspor JSON berfungsi | ✅ Berfungsi | `eksporCatatan()` → Blob → download `nyatet_backup_[ts].json` |
| 16 | Tema bisa diganti | ✅ Berfungsi | 5 tema (Gelap, Arang, Hutan, Laut, Kopi) di HalamanPengaturan |
| 17 | Gate Pro muncul kalau akses fitur terkunci | ⚠️ Ada masalah | Modal Pro bisa dibuka tapi **tidak ada satu pun fitur yang benar-benar di-gate oleh `isPro`**. Semua fitur di ModalPremium hanya iklan — belum diimplementasi. User yang bayar tidak dapat perbedaan apapun. |
| 18 | Modal Pro bisa dibuka | ✅ Berfungsi | Tombol "👑 Pro" di header → `setModalPro(true)` |
| 19 | Tombol bayar Midtrans terhubung | ⚠️ Ada masalah | Frontend → `/.netlify/functions/create-payment` sudah benar. Tapi **butuh `MIDTRANS_SERVER_KEY` di Netlify env vars** sebelum bisa test. Di local dev akan error 500. |
| 20 | Catatan tersimpan setelah refresh | ✅ Berfungsi | `simpanLokal()` → `localStorage["nyatet_v3"]` setiap kali catatan berubah |
| 21 | PWA bisa diinstall di HP | ✅ Berfungsi | `vite-plugin-pwa` + manifest lengkap + service worker Workbox |
| 22 | Notifikasi izin diminta | ⚠️ Ada masalah | `mintaIzinNotif()` ada tapi **tidak dipanggil otomatis saat app pertama dibuka**. Izin hanya diminta saat user aktifkan toggle dzikir atau set pengingat manual. |

---

## Ringkasan

| | Jumlah |
|---|---|
| ✅ Berfungsi | 19 |
| ⚠️ Ada masalah | 3 |
| ❌ Tidak berfungsi | 0 |

---

## Detail Masalah & Rekomendasi

### ⚠️ #17 — Gate Pro tidak ada
**Masalah:** `isPro` state ada di App tapi tidak digunakan untuk mengunci fitur apapun. User yang sudah bayar Pro tidak mendapat perbedaan dibanding gratis.

**Solusi:** Pilih minimal 1 fitur yang benar-benar diimplementasi dan di-gate dengan `isPro`. Rekomendasi: batas jumlah catatan (gratis: 50, Pro: unlimited) atau tema tambahan Pro.

---

### ⚠️ #19 — Midtrans butuh konfigurasi Netlify
**Masalah:** Endpoint `/.netlify/functions/create-payment` berfungsi secara kode tapi akan error 500 di production jika `MIDTRANS_SERVER_KEY` belum diisi di Netlify dashboard.

**Solusi:** Di Netlify → Site Settings → Environment Variables, tambahkan:
```
MIDTRANS_SERVER_KEY = SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION = false
```

---

### ⚠️ #22 — Notifikasi tidak diminta otomatis
**Masalah:** Specifikasi minta "saat app pertama dibuka, minta izin notifikasi" tapi ini tidak diimplementasi. Izin hanya diminta saat user secara aktif mengaktifkan fitur tertentu.

**Solusi (pilihan):**
- Tambah `mintaIzinNotif()` di useEffect App dengan delay 3 detik setelah mount (lebih ramah UX)
- Atau biarkan seperti ini — browser modern justru tidak suka popup izin langsung saat buka, dan bisa menyebabkan user langsung tolak.

**Rekomendasi:** Biarkan seperti sekarang (lazily request) — ini praktik yang lebih baik.

---

## Fitur Bonus yang Ada tapi Tidak di Checklist

| Fitur | Keterangan |
|---|---|
| Mode Fokus | Fullscreen menulis tanpa distraksi |
| Drag & drop item ceklis | Urutkan item dengan drag |
| Kunci catatan (🔒) | Individual note lock |
| Arsip & Sampah | Soft delete dengan recovery |
| Share catatan | Via Web Share API / clipboard |
| Kalender catatan | Lihat catatan per tanggal |
| Motivasi dzikir harian | 7 hadits shahih bergilir tiap hari |
| Warna kartu individual | 8 warna per catatan |
| Counter Dzikir + vibrate + tone | Fitur unik tidak ada di kompetitor |
