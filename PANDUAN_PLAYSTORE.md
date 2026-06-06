# 🚀 Panduan Deploy Nyatet ke Play Store
## PWA → APK → Google Play Store

---

## STRUKTUR FILE PROYEK

```
nyatet/
├── src/
│   ├── main.jsx        ← entry point React
│   └── App.jsx         ← seluruh aplikasi
├── public/
│   ├── icons/          ← icon 72px - 512px
│   ├── manifest.json   ← PWA manifest
│   └── sw.js           ← service worker
├── index.html
├── vite.config.js      ← konfigurasi build + PWA
└── package.json
```

---

## LANGKAH 1 — DEPLOY WEB APP

### Opsi A: Vercel (PALING MUDAH, GRATIS)
1. Buat akun di https://vercel.com
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Di folder proyek, jalankan:
   ```bash
   npm run build
   vercel --prod
   ```
4. Kamu dapat URL seperti: `https://nyatet.vercel.app`

### Opsi B: Netlify
1. Buka https://netlify.com → drag & drop folder `dist/`
2. Otomatis dapat URL seperti: `https://nyatet.netlify.app`

### Opsi C: GitHub Pages
1. Push ke GitHub
2. Aktifkan Pages dari folder `dist/`

> **PENTING:** Setelah deploy, pastikan HTTPS aktif (wajib untuk PWA & notifikasi)

---

## LANGKAH 2 — BUAT APK DENGAN BUBBLEWRAP (Google Resmi)

Bubblewrap adalah tool resmi Google untuk membungkus PWA menjadi APK.

### Install Java & Android SDK
```bash
# Install Java 11
sudo apt install openjdk-11-jdk  # Linux
# atau download dari https://adoptium.net/

# Install Android Studio dari https://developer.android.com/studio
# Set ANDROID_HOME di environment variable
```

### Install Bubblewrap
```bash
npm install -g @bubblewrap/cli
```

### Generate Proyek Android
```bash
mkdir nyatet-android && cd nyatet-android
bubblewrap init --manifest https://nyatet.vercel.app/manifest.json
```

Isi pertanyaan Bubblewrap:
```
Domain:           nyatet.vercel.app
Application name: Nyatet - Catatan Harian
Short name:       Nyatet
Package name:     com.nyatet.app
Version:          1
Version code:     1
Display mode:     standalone
Orientation:      portrait
Theme color:      #080808
Background color: #080808
Start URL:        /
Icon:             /icons/icon-512.png
```

### Build APK
```bash
bubblewrap build
```
Hasil: `app-release-signed.apk` ← ini yang diupload ke Play Store

---

## LANGKAH 3 — DAFTAR GOOGLE PLAY CONSOLE

1. Buka https://play.google.com/console
2. Bayar biaya pendaftaran developer: **$25 (sekali seumur hidup)**
3. Buat aplikasi baru → pilih "Android"
4. Isi semua informasi:

### Informasi Wajib:
- **Nama App:** Nyatet - Catatan Harian
- **Deskripsi Singkat:** Aplikasi catatan harian dengan mood tag & template cepat
- **Deskripsi Panjang:** (lihat template di bawah)
- **Kategori:** Produktivitas
- **Email kontak:** email kamu
- **Kebijakan Privasi:** buat halaman sederhana (wajib)

### Screenshot Wajib:
- Minimal 2 screenshot ukuran 1080×1920 px
- Bisa screenshot dari HP langsung

### Ikon:
- Hi-res icon: 512×512 px (gunakan `icon-512.png`)
- Feature graphic: 1024×500 px (buat di Canva)

---

## LANGKAH 4 — UPLOAD APK

1. Di Play Console → Produksi → Rilis baru
2. Upload `app-release-signed.apk`
3. Isi catatan rilis: "Versi pertama Nyatet"
4. Submit untuk review → biasanya 3-7 hari

---

## TEMPLATE DESKRIPSI PLAY STORE

```
📝 Nyatet — Aplikasi Catatan Harian Terbaik untuk Kamu

Nyatet adalah aplikasi catatan yang dirancang khusus untuk pengguna Indonesia. 
Simpel, cepat, dan penuh fitur yang kamu butuhkan sehari-hari.

✨ FITUR UNGGULAN:

🎯 Mood Tag — Tandai setiap catatan dengan konteks (Penting, Ibadah, Keuangan, dll)
⚡ Template Cepat — 8 template siap pakai: belanja, dzikir, hutang, rapat, dan lainnya
📊 Dashboard Harian — Pantau progress ceklis dan ringkasan aktivitas hari ini
🔍 Filter Pintar — Filter catatan by mood, tipe, atau pin dengan satu ketuk
🎨 Mode Fokus — Tulis tanpa gangguan dengan layar bersih total
🔒 Keamanan PIN — Lindungi aplikasi dengan PIN 4 digit
💾 Tersimpan Lokal — Catatan aman tersimpan di perangkat kamu
📤 Ekspor & Impor — Backup data kapan saja dalam format JSON
📅 Kalender Catatan — Lihat semua catatan per tanggal dalam tampilan kalender
🌙 Dark Mode — Nyaman di mata, hemat baterai

🆓 GRATIS SELAMANYA:
Semua fitur dasar tersedia gratis tanpa batasan.

👑 NYATET PRO:
Untuk pengguna yang butuh lebih: folder, format teks kaya, cadangan cloud, asisten AI, dan laporan mingguan.

📱 Ringan, cepat, dan bekerja offline!
```

---

## KEBIJAKAN PRIVASI (WAJIB)

Buat halaman sederhana dengan isi:

```
Kebijakan Privasi Nyatet
Terakhir diperbarui: Juni 2026

1. Data yang dikumpulkan
Nyatet menyimpan semua catatan HANYA di perangkat kamu (localStorage).
Kami tidak mengumpulkan, menyimpan, atau mengirim data apapun ke server.

2. Notifikasi
Notifikasi pengingat dikirim lokal dari perangkat kamu sendiri.

3. Tidak ada iklan
Nyatet tidak menampilkan iklan apapun.

4. Kontak
Pertanyaan: nyatet.app@gmail.com
```

Host di: GitHub Pages / Vercel / Carrd.co (gratis)

---

## CHECKLIST SEBELUM SUBMIT

- [ ] Web app sudah deploy dan HTTPS aktif
- [ ] PWA bisa diinstall di HP (muncul banner "Add to Home Screen")
- [ ] APK berhasil dibuild dengan Bubblewrap
- [ ] Semua screenshot sudah siap (min. 2)
- [ ] Ikon 512×512 dan feature graphic 1024×500 sudah siap
- [ ] Halaman kebijakan privasi sudah online
- [ ] Akun Google Play Console sudah daftar + bayar $25
- [ ] Deskripsi app sudah ditulis

---

## CATATAN PENTING

**Digital Asset Links:** 
Setelah APK siap, kamu perlu tambahkan file verifikasi di server:
```
https://nyatet.vercel.app/.well-known/assetlinks.json
```
Bubblewrap akan generate isi file ini otomatis. Upload ke `public/` folder.

**Signed APK:**
Bubblewrap akan buat keystore otomatis. SIMPAN file keystore ini — kamu butuh untuk update app di masa depan!

---

*Dibuat dengan ❤️ — Nyatet v1.0*
