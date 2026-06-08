// src/ProFitur.jsx
// Komponen-komponen fitur Pro (weekly insight, voice, OCR, Quran/Hadits ref, smart reminder).
// Semua bergantung pada AI_ENDPOINT (sama dengan HalamanTanyaAI) dan pola panggilAI.

import { useState, useRef, useEffect } from "react";

const AI_ENDPOINT = "/.netlify/functions/ai-asisten";

// Helper: panggil backend AI generik. Mengembalikan string hasil atau throw error.
async function panggilAI(payload) {
  const res = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.hasil) throw new Error(data.error || "AI tidak merespons");
  return data.hasil;
}

// Helper: parse JSON dari respons AI yang kadang dibungkus prosa / markdown / sedikit kepotong.
function parseJSONLonggar(raw) {
  let s = (raw || "").replace(/```json/gi, "").replace(/```/g, "").trim();
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  try {
    return JSON.parse(s);
  } catch {
    // Salvage: kalau string array kepotong, potong sampai objek lengkap terakhir lalu tutup.
    const lastObj = s.lastIndexOf("}");
    if (lastObj > 0) {
      let repaired = s.slice(0, lastObj + 1);
      const openArr = (repaired.match(/\[/g) || []).length;
      const closeArr = (repaired.match(/\]/g) || []).length;
      if (openArr > closeArr) repaired += "]";
      const openObj = (repaired.match(/\{/g) || []).length;
      const closeObj = (repaired.match(/\}/g) || []).length;
      if (openObj > closeObj) repaired += "}";
      return JSON.parse(repaired);
    }
    throw new Error("Format jawaban AI tidak valid. Coba generate ulang.");
  }
}

// Helper: ringkasan catatan (dipakai weeklyInsight & smartReminder)
function ringkasan(catatan, max = 30) {
  return (catatan || [])
    .filter((n) => !n.hapus && !n.arsip)
    .slice(0, max)
    .map((n) => ({
      judul: n.judul,
      isi: (n.isi || "").replace(/<[^>]+>/g, " ").slice(0, 400),
      item: (n.item || []).map((i) => (i.cek ? "[x] " : "[ ] ") + i.teks).join(" | "),
      diubah: n.diubah || n.dibuat,
    }));
}

// ═══════════════════════ 1) AI WEEKLY INSIGHT ════════════════════════════════
export function HalamanInsight({ catatan, isPro, onGatePro, t, tema }) {
  const [hasil, setHasil] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const generate = async () => {
    if (!isPro) {
      onGatePro?.("AI Weekly Insight tersedia untuk pengguna Pro 🧠");
      return;
    }
    setLoading(true);
    setErr("");
    setHasil("");
    try {
      const out = await panggilAI({ mode: "weeklyInsight", semuaCatatan: ringkasan(catatan) });
      setHasil(out);
    } catch (e) {
      setErr(e.message || "Gagal");
    }
    setLoading(false);
  };

  // Auto-generate saat pertama buka (kalau belum ada hasil & catatan cukup)
  useEffect(() => {
    if (!hasil && !loading && !err && catatan.filter((n) => !n.hapus && !n.arsip).length >= 3) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isTerang = t && t.kartu === "#ffffff";
  const aksen = tema?.aksen || "#28c0b6";

  return (
    <div style={{ padding: 16 }}>
      <div style={{ background: "linear-gradient(135deg,#191200,#0e0e0e)", border: "1px solid #f5c84244", borderRadius: 14, padding: 18, marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 38 }}>🧠</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#f5c842", fontWeight: 800, fontSize: 16 }}>AI Weekly Insight</div>
          <div style={{ color: "#9a8a4a", fontSize: 12, marginTop: 3 }}>AI merangkum 1 minggu catatanmu jadi insight personal</div>
        </div>
        <button onClick={generate} disabled={loading} style={{ background: "#f5c842", border: "none", borderRadius: 10, padding: "8px 14px", color: "#000", fontWeight: 700, fontSize: 12, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1, flexShrink: 0 }}>
          {loading ? "⏳" : "🔄"} Ulang
        </button>
      </div>

      {!isPro && (
        <div style={{ background: "#191200", border: "1px solid #f5c84244", borderRadius: 12, padding: 14, marginBottom: 14, textAlign: "center" }}>
          <div style={{ color: "#f5c842", fontSize: 13, fontWeight: 700 }}>👑 Fitur Pro</div>
          <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>Upgrade Pro untuk membuka insight mingguan dari AI</div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 32, color: t.subteks }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🧠</div>
          <div>AI sedang membaca catatanmu…</div>
        </div>
      )}

      {err && !loading && (
        <div style={{ background: "#2a0e0e", border: "1px solid #5a1010", borderRadius: 12, padding: 14, color: "#e84040", fontSize: 13 }}>❌ {err}</div>
      )}

      {hasil && !loading && (
        <div style={{ background: t.kartu, border: `1px solid ${t.border}`, borderRadius: 14, padding: 18, fontSize: 14, lineHeight: 1.75, color: t.teks, whiteSpace: "pre-wrap" }}>
          {hasil}
        </div>
      )}

      {!loading && !hasil && !err && catatan.filter((n) => !n.hapus && !n.arsip).length < 3 && (
        <div style={{ textAlign: "center", padding: 32, color: t.muted, fontSize: 13 }}>
          Tulis minimal 3 catatan agar AI bisa memberikan insight.
        </div>
      )}
    </div>
  );
}

// ═══════════════════════ 2) VOICE → CATATAN ══════════════════════════════════
export function ModalVoice({ isPro, onGatePro, onHasil, t, tema, onClose }) {
  const [rec, setRec] = useState(false);
  const [transkrip, setTranskrip] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const recogRef = useRef(null);
  const interimRef = useRef("");

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErr("Browser kamu belum mendukung pengenalan suara. Coba Chrome desktop.");
    } else {
      const r = new SR();
      r.lang = "id-ID";
      r.continuous = true;
      r.interimResults = true;
      r.onresult = (ev) => {
        let final = "";
        let interim = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          if (ev.results[i].isFinal) final += ev.results[i][0].transcript;
          else interim += ev.results[i][0].transcript;
        }
        if (final) setTranskrip((p) => (p + " " + final).trim());
        interimRef.current = interim;
      };
      r.onerror = (e) => setErr("Error mic: " + e.error);
      r.onend = () => setRec(false);
      recogRef.current = r;
    }
    return () => {
      try { recogRef.current?.stop(); } catch {}
    };
  }, []);

  const mulai = () => {
    if (!isPro) {
      onGatePro?.("Voice → Catatan tersedia untuk pengguna Pro 🎙️");
      return;
    }
    if (!recogRef.current) return;
    setErr("");
    setTranskrip("");
    interimRef.current = "";
    setRec(true);
    try { recogRef.current.start(); } catch {}
  };
  const berhenti = () => {
    try { recogRef.current?.stop(); } catch {}
    setRec(false);
  };

  const rapikan = async () => {
    if (!transkrip.trim()) return;
    setLoading(true);
    setErr("");
    try {
      const out = await panggilAI({ mode: "ringkasanVoice", teks: transkrip });
      onHasil?.(out);
      onClose?.();
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: t.nav, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 18, paddingBottom: 28, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: t.teks, fontWeight: 800, fontSize: 16 }}>🎙️ Voice → Catatan</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.muted, fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        <div style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14, minHeight: 120, maxHeight: 220, overflow: "auto", color: t.teks, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {transkrip || <span style={{ color: t.muted }}>Transkrip muncul di sini…</span>}
          {interimRef.current && <span style={{ color: t.subteks }}> {interimRef.current}</span>}
        </div>

        {err && <div style={{ color: "#e84040", fontSize: 12 }}>❌ {err}</div>}

        <div style={{ display: "flex", gap: 8 }}>
          {!rec ? (
            <button onClick={mulai} disabled={!recogRef.current} style={{ flex: 1, background: "#e84040", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              🔴 Mulai Rekam
            </button>
          ) : (
            <button onClick={berhenti} style={{ flex: 1, background: "#5a0e0e", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              ⏹️ Berhenti
            </button>
          )}
          <button onClick={rapikan} disabled={!transkrip.trim() || loading} style={{ flex: 1, background: tema?.aksen || "#28c0b6", border: "none", borderRadius: 12, padding: "14px", color: "#000", fontWeight: 800, fontSize: 15, cursor: loading ? "wait" : "pointer", opacity: transkrip.trim() && !loading ? 1 : 0.4 }}>
            {loading ? "⏳" : "✨"} Rapikan → Catatan
          </button>
        </div>
        <div style={{ color: t.muted, fontSize: 11, textAlign: "center" }}>Bicara bebas. AI yang rapiin & buatin paragraf.</div>
      </div>
    </div>
  );
}

// ═══════════════════════ 3) OCR SCAN → CATATAN ══════════════════════════════
export function ModalOCR({ isPro, onGatePro, onHasil, t, tema, onClose }) {
  const [img, setImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("File harus gambar (jpg/png/webp).");
      return;
    }
    setErr("");
    const reader = new FileReader();
    reader.onload = () => setImg(reader.result);
    reader.readAsDataURL(file);
  };

  const proses = async () => {
    if (!img) return;
    if (!isPro) {
      onGatePro?.("Scan → Catatan (OCR) tersedia untuk pengguna Pro 📷");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      // Pakai Tesseract.js dari CDN (offline-capable). Versi: 5.x
      if (!window.Tesseract) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      const { data } = await window.Tesseract.recognize(img, "ind+eng", {
        logger: () => {},
      });
      const teks = (data?.text || "").trim();
      if (!teks) throw new Error("Teks tidak terbaca. Coba foto lebih jelas / cahaya cukup.");
      const out = await panggilAI({ mode: "ringkasanOCR", teks });
      onHasil?.(out);
      onClose?.();
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: t.nav, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 18, paddingBottom: 28, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: t.teks, fontWeight: 800, fontSize: 16 }}>📷 Scan → Catatan</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.muted, fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
          style={{ background: t.input, border: `2px dashed ${drag ? tema.aksen : t.border}`, borderRadius: 12, padding: 18, minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 8, textAlign: "center" }}
        >
          {img ? (
            <img src={img} alt="preview" style={{ maxWidth: "100%", maxHeight: 180, borderRadius: 8 }} />
          ) : (
            <>
              <div style={{ fontSize: 36 }}>📷</div>
              <div style={{ color: t.teks, fontSize: 14, fontWeight: 700 }}>Klik / drop foto di sini</div>
              <div style={{ color: t.muted, fontSize: 11 }}>jpg · png · webp · tulisan tangan / struk / kwitansi</div>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleFile(e.target.files?.[0])} style={{ display: "none" }} />

        {err && <div style={{ color: "#e84040", fontSize: 12 }}>❌ {err}</div>}

        <button onClick={proses} disabled={!img || loading} style={{ background: tema?.aksen || "#28c0b6", border: "none", borderRadius: 12, padding: "14px", color: "#000", fontWeight: 800, fontSize: 15, cursor: loading ? "wait" : "pointer", opacity: img && !loading ? 1 : 0.4 }}>
          {loading ? "⏳ Membaca…" : "✨"} Scan & Rapikan
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════ 6) AL-QURAN (alquran.cloud, tanpa AI) ══════════════
// Sumber: alquran.cloud via proxy /.netlify/functions/quran. Terjemahan resmi Kemenag RI.
// Teks ayat & terjemahan otentik — tanpa AI, tanpa risiko halusinasi.
const QURAN_API = "/.netlify/functions/quran";

// Font bergaya Mushaf Madinah (Uthmani). Teks dari alquran.cloud sudah Uthmani (Mushaf Madinah).
const FONT_ARAB = "'Amiri Quran','Traditional Arabic','Scheherazade New',serif";

// Qori murottal (audio dari everyayah.com — bebas CORS, stabil)
const QORI = [
  { id: "Alafasy_64kbps",            nama: "Al-Afasy" },
  { id: "Husary_64kbps",             nama: "Al-Husary" },
  { id: "Minshawy_Murattal_128kbps", nama: "Al-Minshawi" },
];
const VALID_QORI = new Set(QORI.map((q) => q.id));
// surahNo + verseNo masing-masing di-pad 3 digit, contoh: surah 1 ayat 1 → "001001"
const urlAudio = (folder, surahNo, verseNo) =>
  `https://everyayah.com/data/${folder}/${String(surahNo).padStart(3,"0")}${String(verseNo).padStart(3,"0")}.mp3`;

export function HalamanQuran({ t, tema }) {
  const aksen = tema?.aksen || "#28c0b6";
  const [surat, setSurat] = useState([]);
  const [pilih, setPilih] = useState(null);   // { info, ayat:[{no,arab,indo}] }
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [cari, setCari] = useState("");
  const [terjemah, setTerjemah] = useState(() => {
    try { return localStorage.getItem("kp_quran_terjemah") !== "0"; } catch { return true; }
  });
  const [terakhir, setTerakhir] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kp_quran_terakhir") || "null"); } catch { return null; }
  });
  const [ayatDitandai, setAyatDitandai] = useState(null); // nomor ayat yang ditandai di surah aktif
  const [qori, setQori] = useState(() => {
    try {
      const stored = localStorage.getItem("kp_quran_qori") || "";
      return VALID_QORI.has(stored) ? stored : QORI[0].id;
    } catch { return QORI[0].id; }
  });
  const [mainAyat, setMainAyat] = useState(null); // nomor ayat yang sedang diputar
  const [loadingAudio, setLoadingAudio] = useState(null); // nomor ayat yang sedang buffering
  const gotoAyahRef = useRef(null);
  const terakhirRef = useRef(terakhir);
  const audioRef = useRef(null);

  useEffect(() => { try { localStorage.setItem("kp_quran_qori", qori); } catch {} }, [qori]);
  // Hentikan audio saat keluar komponen
  useEffect(() => () => { try { audioRef.current?.pause(); } catch {} }, []);

  useEffect(() => { try { localStorage.setItem("kp_quran_terjemah", terjemah ? "1" : "0"); } catch {} }, [terjemah]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${QURAN_API}?jenis=surat`);
        const data = await res.json();
        setSurat(data.data || []);
      } catch {
        setErr("Gagal memuat daftar surah. Periksa koneksi internet.");
      }
      setLoading(false);
    })();
  }, []);

  // Simpan posisi terakhir dibaca (hanya ke ref + localStorage agar tak memicu re-render saat scroll)
  const persistTerakhir = (info, ayah) => {
    const rec = { number: info.number, name: info.name, englishName: info.englishName, ayah, waktu: Date.now() };
    terakhirRef.current = rec;
    try { localStorage.setItem("kp_quran_terakhir", JSON.stringify(rec)); } catch {}
  };

  const bukaSurat = async (s, gotoAyah) => {
    setLoading(true);
    setErr("");
    setPilih(null);
    gotoAyahRef.current = gotoAyah || null;
    try {
      const res = await fetch(`${QURAN_API}?jenis=ayat&surat=${s.number}`);
      const data = await res.json();
      const eds = data.data || [];
      const arab = eds.find((e) => e.edition?.identifier === "quran-uthmani") || eds[0];
      const indo = eds.find((e) => e.edition?.identifier === "id.indonesian") || eds[1];
      const ayat = (arab?.ayahs || []).map((a, i) => ({
        no: a.numberInSurah,
        global: a.number,        // nomor ayat global (1-6236) untuk URL audio
        arab: a.text,
        indo: indo?.ayahs?.[i]?.text || "",
      }));
      setPilih({ info: s, ayat });
      setAyatDitandai(terakhirRef.current?.number === s.number ? terakhirRef.current.ayah : null);
      if (!gotoAyah) window.scrollTo?.(0, 0);
    } catch {
      setErr("Gagal memuat ayat.");
    }
    setLoading(false);
  };

  // Tandai ayat sebagai "terakhir dibaca" (eksplisit, saat di-klik)
  const tandai = (ayah) => {
    persistTerakhir(pilih.info, ayah);
    setAyatDitandai(ayah);
    setTerakhir(terakhirRef.current);
  };

  // ── AUDIO MUROTTAL ──
  const getAudio = () => {
    if (!audioRef.current) audioRef.current = new Audio();
    return audioRef.current;
  };
  const putarAyat = (ayat, lanjut) => {
    if (!ayat) { setMainAyat(null); setLoadingAudio(null); return; }
    const au = getAudio();
    try { au.pause(); } catch {}

    // Bersihkan handler lama sebelum pasang yang baru
    au.onplaying = null;
    au.onended   = null;
    au.onerror   = null;
    au.onstalled = null;

    au.src = urlAudio(qori, pilih.info.number, ayat.no);

    // "playing" fire saat audio BETUL-BETUL mulai bersuara (setelah buffering selesai)
    au.onplaying = () => { setMainAyat(ayat.no); setLoadingAudio(null); };
    au.onended   = () => {
      if (lanjut) {
        const idx = pilih.ayat.findIndex((x) => x.no === ayat.no);
        putarAyat(pilih.ayat[idx + 1], true);
      } else { setMainAyat(null); setLoadingAudio(null); }
    };
    au.onerror   = () => { setMainAyat(null); setLoadingAudio(null); };
    // Jika koneksi lambat dan audio terstall, tetap tunjukkan loading
    au.onstalled = () => { if (loadingAudio !== ayat.no) setLoadingAudio(ayat.no); };

    setLoadingAudio(ayat.no);
    setMainAyat(null);
    au.load();
    au.play().catch(() => { setMainAyat(null); setLoadingAudio(null); });

    document.getElementById(`ayat-${ayat.no}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  const stopAudio = () => { try { audioRef.current?.pause(); } catch {} setMainAyat(null); setLoadingAudio(null); };
  const toggleAyat = (ayat) => { (mainAyat === ayat.no || loadingAudio === ayat.no) ? stopAudio() : putarAyat(ayat, false); };
  const putarSurah = () => { mainAyat ? stopAudio() : putarAyat(pilih.ayat[0], true); };

  const kembaliKeDaftar = () => {
    stopAudio();
    setPilih(null);
    setTerakhir(terakhirRef.current); // refresh banner "lanjutkan membaca"
  };

  // Setelah surah tampil: scroll ke ayat tujuan (saat "lanjutkan membaca")
  useEffect(() => {
    if (!pilih) return;
    if (gotoAyahRef.current && gotoAyahRef.current > 1) {
      const target = gotoAyahRef.current;
      setTimeout(() => document.getElementById(`ayat-${target}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
    gotoAyahRef.current = null;
  }, [pilih]);

  const terfilter = surat.filter((s) => {
    const q = cari.trim().toLowerCase();
    if (!q) return true;
    return String(s.number) === q || (s.englishName || "").toLowerCase().includes(q) || (s.englishNameTranslation || "").toLowerCase().includes(q);
  });

  const lanjutSurah = () => {
    const r = terakhir;
    const s = surat.find((x) => x.number === r.number);
    if (s) bukaSurat(s, r.ayah);
  };

  return (
    <div style={{ padding: 16 }}>
      {loading && <div style={{ textAlign: "center", padding: 28, color: t.subteks }}>⏳ Memuat…</div>}
      {err && !loading && <div style={{ background: "#2a0e0e", border: "1px solid #5a1010", borderRadius: 12, padding: 14, color: "#e84040", fontSize: 13 }}>❌ {err}</div>}

      {/* DETAIL SURAH (daftar ayat) */}
      {!loading && pilih && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <button onClick={kembaliKeDaftar} style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: "8px 14px", color: aksen, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              ← Daftar Surah
            </button>
            <button onClick={() => setTerjemah((v) => !v)} style={{ background: terjemah ? aksen : t.input, border: `1px solid ${terjemah ? aksen : t.border}`, borderRadius: 10, padding: "8px 14px", color: terjemah ? "#000" : t.subteks, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {terjemah ? "✓ Terjemahan" : "Terjemahan"}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={putarSurah} style={{ background: mainAyat ? "#5a0e0e" : aksen, border: "none", borderRadius: 10, padding: "8px 14px", color: mainAyat ? "#fff" : "#000", fontSize: 12, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
              {mainAyat ? "⏹️ Berhenti" : "▶️ Putar Surah"}
            </button>
            <select value={qori} onChange={(e) => { stopAudio(); setQori(e.target.value); }} style={{ flex: 1, background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: "8px 12px", color: t.teks, fontSize: 12, fontWeight: 700, cursor: "pointer", outline: "none" }}>
              {QORI.map((q) => <option key={q.id} value={q.id}>🎙️ {q.nama}</option>)}
            </select>
          </div>
          {/* Header surah */}
          <div style={{ background: `linear-gradient(135deg, ${aksen}22, ${aksen}08)`, border: `1px solid ${aksen}33`, borderRadius: 16, padding: "20px 16px", textAlign: "center" }}>
            <div style={{ color: t.teks, fontSize: 30, fontWeight: 800, fontFamily: FONT_ARAB, marginBottom: 6 }}>{pilih.info.name}</div>
            <div style={{ color: aksen, fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{pilih.info.englishName}</div>
            <div style={{ color: t.subteks, fontSize: 12 }}>{pilih.info.englishNameTranslation} · {pilih.info.numberOfAyahs} ayat · {pilih.info.revelationType === "Meccan" ? "Makkiyah" : "Madaniyah"}</div>
          </div>

          {/* Daftar ayat */}
          {pilih.ayat.map((a, idx) => {
            const isPlaying  = mainAyat === a.no;
            const isLoading  = loadingAudio === a.no;
            const isDitandai = ayatDitandai === a.no;
            const isGanjil   = idx % 2 !== 0;
            const cardBg     = isDitandai ? `${aksen}14` : isGanjil ? t.input : t.kartu;
            const leftBorder = isPlaying ? aksen : isDitandai ? aksen : isGanjil ? `${aksen}55` : `${aksen}22`;
            return (
              <div key={a.no} id={`ayat-${a.no}`} data-ayah={a.no}
                style={{ background: cardBg, border: `1px solid ${isDitandai ? aksen : t.border}`, borderLeft: `4px solid ${leftBorder}`, borderRadius: 14, padding: "14px 16px", scrollMarginTop: 70, transition: "background 0.2s" }}>
                {/* Baris atas: nomor + aksi */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  {/* Badge nomor */}
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: isPlaying ? aksen : `${aksen}1a`, border: `1.5px solid ${aksen}55`, color: isPlaying ? "#000" : aksen, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{a.no}</div>
                  {/* Tombol aksi */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button onClick={() => tandai(a.no)} title="Tandai terakhir dibaca"
                      style={{ background: isDitandai ? `${aksen}22` : "none", border: isDitandai ? `1px solid ${aksen}55` : "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: isDitandai ? aksen : t.muted, display: "flex", alignItems: "center", gap: 4 }}>
                      🔖{isDitandai ? <span>Terakhir dibaca</span> : null}
                    </button>
                    <button onClick={() => toggleAyat(a)} title="Putar ayat"
                      style={{ width: 30, height: 30, borderRadius: "50%", background: (isPlaying || isLoading) ? aksen : `${aksen}1a`, border: `1.5px solid ${aksen}55`, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", color: (isPlaying || isLoading) ? "#000" : aksen }}>
                      {isLoading ? "⏳" : isPlaying ? "⏸" : "▶"}
                    </button>
                  </div>
                </div>
                {/* Teks Arab */}
                <div style={{ color: t.teks, fontSize: 26, lineHeight: 2.4, textAlign: "right", fontFamily: FONT_ARAB, direction: "rtl", marginBottom: terjemah ? 12 : 0 }}>{a.arab}</div>
                {/* Terjemahan */}
                {terjemah && (
                  <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 10, color: t.subteks, fontSize: 13.5, lineHeight: 1.75, fontStyle: "italic" }}>
                    {a.indo}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ color: t.muted, fontSize: 11, textAlign: "center", paddingBottom: 8 }}>Sumber: alquran.cloud — teks Uthmani (Mushaf Madinah) + terjemahan resmi Kemenag RI.</div>
        </div>
      )}

      {/* DAFTAR SURAH */}
      {!loading && !pilih && surat.length > 0 && (
        <>
          {terakhir && surat.some((s) => s.number === terakhir.number) && (
            <button onClick={lanjutSurah} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, textAlign: "left", background: `linear-gradient(135deg, ${aksen}22, ${aksen}08)`, border: `1px solid ${aksen}55`, borderRadius: 12, padding: 14, cursor: "pointer", marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>📖</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", color: t.muted, fontSize: 11 }}>Lanjutkan membaca</span>
                <span style={{ display: "block", color: t.teks, fontSize: 14, fontWeight: 700, marginTop: 2 }}>QS {terakhir.englishName} : ayat {terakhir.ayah}</span>
              </span>
              <span style={{ color: aksen, fontSize: 20 }}>›</span>
            </button>
          )}
          <input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari surah (nama / nomor)…"
            style={{ width: "100%", background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: "12px 14px", color: t.teks, fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {terfilter.map((s) => (
              <button key={s.number} onClick={() => bukaSurat(s)} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", background: t.kartu, border: `1px solid ${t.border}`, borderRadius: 12, padding: 12, cursor: "pointer" }}>
                <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", background: t.input, color: aksen, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.number}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", color: t.teks, fontSize: 14, fontWeight: 700 }}>{s.englishName}</span>
                  <span style={{ display: "block", color: t.muted, fontSize: 11, marginTop: 2 }}>{s.englishNameTranslation} · {s.numberOfAyahs} ayat</span>
                </span>
                <span style={{ color: t.teks, fontSize: 20, fontFamily: FONT_ARAB, flexShrink: 0 }}>{s.name}</span>
              </button>
            ))}
            {terfilter.length === 0 && <div style={{ color: t.muted, fontSize: 13, textAlign: "center", padding: 20 }}>Surah tidak ditemukan.</div>}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════ 5) SMART REMINDER KONTEKSTUAL ═══════════════════════
export function PanelSmartReminder({ catatan, isPro, onGatePro, t, tema }) {
  const [buka, setBuka] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const generate = async () => {
    if (!isPro) {
      onGatePro?.("Smart Reminder AI tersedia untuk pengguna Pro 🔗");
      return;
    }
    setBuka(true);
    setLoading(true);
    setErr("");
    setData(null);
    try {
      const raw = await panggilAI({ mode: "smartReminder", semuaCatatan: ringkasan(catatan) });
      setData(parseJSONLonggar(raw));
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  const KAT_WARNA = { ibadah: "#34c776", keuangan: "#3d9de8", kesehatan: "#e84040", kerja: "#9b59e8", sosial: "#f5c842", lainnya: "#888" };

  return (
    <>
      <button onClick={generate} style={{ width: "100%", background: "linear-gradient(135deg,#191200,#0e0e0e)", border: "1px solid #f5c84244", borderRadius: 12, padding: 14, color: "#f5c842", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>🔗</span>
        <div style={{ flex: 1, textAlign: "left" }}>
          <div>Smart Reminder AI</div>
          <div style={{ color: "#8a7a3a", fontSize: 11, fontWeight: 400, marginTop: 2 }}>Pengingat kontekstual dari catatanmu</div>
        </div>
        <span style={{ fontSize: 16 }}>✨</span>
      </button>
      {buka && (
        <div onClick={() => setBuka(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, maxHeight: "80vh", overflow: "auto", background: t.nav, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 18, paddingBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ color: t.teks, fontWeight: 800, fontSize: 16 }}>🔗 Smart Reminder</div>
              <button onClick={() => setBuka(false)} style={{ background: "none", border: "none", color: t.muted, fontSize: 22, cursor: "pointer" }}>×</button>
            </div>
            {loading && <div style={{ textAlign: "center", padding: 24, color: t.subteks }}>⏳ AI menganalisis catatanmu…</div>}
            {err && <div style={{ color: "#e84040", fontSize: 13 }}>❌ {err}</div>}
            {data?.pengingat?.map((p, i) => (
              <div key={i} style={{ background: t.input, border: `1px solid ${t.border}`, borderLeft: `3px solid ${KAT_WARNA[p.kategori] || "#888"}`, borderRadius: 10, padding: 12, display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: t.teks, fontSize: 14, fontWeight: 700 }}>{p.judul}</div>
                  <div style={{ color: t.subteks, fontSize: 12, marginTop: 3, lineHeight: 1.5 }}>{p.deskripsi}</div>
                </div>
              </div>
            ))}
            <button onClick={generate} disabled={loading} style={{ background: tema?.aksen || "#28c0b6", border: "none", borderRadius: 12, padding: "12px", color: "#000", fontWeight: 700, fontSize: 13, cursor: loading ? "wait" : "pointer" }}>
              🔄 Generate Ulang
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════ 7) HADITS SHAHIH (HadeethEnc, tanpa AI) ═════════════
// Sumber: HadeethEnc.com via proxy /.netlify/functions/hadits.
// Hanya memuat hadits shahih/hasan, lengkap derajat + takhrij + syarah (Bahasa Indonesia).
const HADITS_API = "/.netlify/functions/hadits";

function isRootCat(k) {
  return k.parent_id == null || k.parent_id === 0 || k.parent_id === "0" || k.parent_id === "";
}

export function HalamanHadits({ t, tema }) {
  const aksen = tema?.aksen || "#28c0b6";
  const [kategori, setKategori] = useState([]);   // semua kategori (flat)
  const [stack, setStack] = useState([]);          // breadcrumb: [{id,title}]
  const [daftar, setDaftar] = useState(null);      // daftar hadits pada kategori daun
  const [detail, setDetail] = useState(null);      // hadits terpilih
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${HADITS_API}?jenis=kategori`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        setKategori(list);
      } catch {
        setErr("Gagal memuat kategori. Periksa koneksi internet.");
      }
      setLoading(false);
    })();
  }, []);

  const parentId = stack.length ? stack[stack.length - 1].id : null;
  const anakKategori = parentId == null
    ? kategori.filter(isRootCat)
    : kategori.filter((k) => String(k.parent_id) === String(parentId));

  const bukaKategori = async (k) => {
    const punyaAnak = kategori.some((c) => String(c.parent_id) === String(k.id));
    setStack((s) => [...s, k]);
    setDaftar(null);
    setDetail(null);
    setErr("");
    if (!punyaAnak) {
      setLoading(true);
      try {
        const res = await fetch(`${HADITS_API}?jenis=daftar&kategori=${k.id}`);
        const data = await res.json();
        setDaftar(data.data || []);
      } catch {
        setErr("Gagal memuat daftar hadits.");
      }
      setLoading(false);
    }
  };

  const bukaHadits = async (h) => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${HADITS_API}?jenis=satu&id=${h.id}`);
      setDetail(await res.json());
    } catch {
      setErr("Gagal memuat hadits.");
    }
    setLoading(false);
  };

  const kembali = () => {
    setErr("");
    if (detail) { setDetail(null); return; }
    if (daftar) { setDaftar(null); setStack((s) => s.slice(0, -1)); return; }
    if (stack.length) { setStack((s) => s.slice(0, -1)); return; }
  };

  const adaNav = detail || daftar || stack.length > 0;
  const judulNav = detail ? "Hadits" : (stack.length ? stack[stack.length - 1].title : "Kategori");

  const Badge = ({ teks }) => (
    <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 10, background: "#0d5c2a", color: "#fff", fontWeight: 700 }}>{teks}</span>
  );

  return (
    <div style={{ padding: 16 }}>
      {adaNav && (
        <button onClick={kembali} style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 10, padding: "8px 14px", color: aksen, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 12 }}>
          ← {judulNav}
        </button>
      )}

      {loading && <div style={{ textAlign: "center", padding: 28, color: t.subteks }}>⏳ Memuat…</div>}
      {err && !loading && <div style={{ background: "#2a0e0e", border: "1px solid #5a1010", borderRadius: 12, padding: 14, color: "#e84040", fontSize: 13 }}>❌ {err}</div>}

      {/* DETAIL HADITS */}
      {!loading && detail && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: t.kartu, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {detail.grade && <Badge teks={detail.grade} />}
              {detail.attribution && <span style={{ color: aksen, fontSize: 12, fontWeight: 700 }}>{detail.attribution}</span>}
            </div>
            {detail.hadith_arabic && (
              <div style={{ color: t.teks, fontSize: 21, lineHeight: 2.2, textAlign: "right", fontFamily: FONT_ARAB, direction: "rtl", marginBottom: 12 }}>{detail.hadith_arabic}</div>
            )}
            <div style={{ color: t.teks, fontSize: 14.5, lineHeight: 1.8 }}>{detail.hadith_indonesian || detail.hadith}</div>
          </div>

          {detail.explanation && (
            <div style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ color: aksen, fontSize: 12, fontWeight: 800, marginBottom: 6, letterSpacing: 0.5 }}>📝 SYARAH</div>
              <div style={{ color: t.subteks, fontSize: 13, lineHeight: 1.7 }}>{detail.explanation}</div>
            </div>
          )}
          {detail.hints && (Array.isArray(detail.hints) ? detail.hints.length > 0 : true) && (
            <div style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14 }}>
              <div style={{ color: aksen, fontSize: 12, fontWeight: 800, marginBottom: 6, letterSpacing: 0.5 }}>💡 FAEDAH</div>
              <div style={{ color: t.subteks, fontSize: 13, lineHeight: 1.7 }}>
                {Array.isArray(detail.hints) ? detail.hints.join(" · ") : detail.hints}
              </div>
            </div>
          )}
          <div style={{ color: t.muted, fontSize: 11, textAlign: "center" }}>Sumber: HadeethEnc.com (Ensiklopedia Hadits Nabawi) — hanya hadits shahih/hasan.</div>
        </div>
      )}

      {/* DAFTAR HADITS */}
      {!loading && !detail && daftar && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {daftar.length === 0 && <div style={{ color: t.muted, fontSize: 13, textAlign: "center", padding: 20 }}>Belum ada hadits di kategori ini.</div>}
          {daftar.map((h) => (
            <button key={h.id} onClick={() => bukaHadits(h)} style={{ textAlign: "left", background: t.kartu, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14, color: t.teks, fontSize: 13.5, lineHeight: 1.6, cursor: "pointer", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: aksen, flexShrink: 0 }}>📜</span>
              <span>{h.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* KATEGORI */}
      {!loading && !detail && !daftar && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {anakKategori.map((k) => (
            <button key={k.id} onClick={() => bukaKategori(k)} style={{ background: t.kartu, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14, color: t.teks, fontSize: 13, fontWeight: 600, lineHeight: 1.5, cursor: "pointer", textAlign: "left", minHeight: 64, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 6 }}>
              <span>📂 {k.title}</span>
              {k.hadeeths_count != null && <span style={{ color: aksen, fontSize: 11, fontWeight: 700 }}>{k.hadeeths_count} hadits</span>}
            </button>
          ))}
          {anakKategori.length === 0 && !err && <div style={{ color: t.muted, fontSize: 13, gridColumn: "1 / -1", textAlign: "center", padding: 20 }}>Tidak ada kategori.</div>}
        </div>
      )}
    </div>
  );
}
