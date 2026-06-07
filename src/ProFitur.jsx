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

// ═══════════════════════ 6) QURAN/HADITS REFERENCE ═════════════════════════
export function PanelQuranRef({ topik, isPro, onGatePro, t, tema }) {
  const [buka, setBuka] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const cari = async () => {
    if (!isPro) {
      onGatePro?.("Referensi Quran/Hadits tersedia untuk pengguna Pro 📖");
      return;
    }
    if (!topik?.trim()) return;
    setBuka(true);
    setLoading(true);
    setErr("");
    setData(null);
    try {
      const raw = await panggilAI({ mode: "quranRef", teks: topik });
      // Parse JSON (kadang ada ```json wrapper)
      const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      setData(parsed);
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  return (
    <>
      <button onClick={cari} title="Cari ayat/hadits terkait" style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 8, padding: "4px 9px", color: tema?.aksen || "#28c0b6", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
        📖 Ayat
      </button>
      {buka && (
        <div onClick={() => setBuka(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, maxHeight: "80vh", overflow: "auto", background: t.nav, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 18, paddingBottom: 28, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ color: t.teks, fontWeight: 800, fontSize: 16 }}>📖 Referensi untuk "{topik?.slice(0, 30)}{topik?.length > 30 ? "…" : ""}"</div>
              <button onClick={() => setBuka(false)} style={{ background: "none", border: "none", color: t.muted, fontSize: 22, cursor: "pointer" }}>×</button>
            </div>
            {loading && <div style={{ textAlign: "center", padding: 24, color: t.subteks }}>⏳ Mencari ayat & hadits…</div>}
            {err && <div style={{ color: "#e84040", fontSize: 13 }}>❌ {err}</div>}
            {data?.rekomendasi?.map((r, i) => (
              <div key={i} style={{ background: t.input, border: `1px solid ${t.border}`, borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: r.jenis === "quran" ? "#0d5c2a" : "#7a3800", color: "#fff", fontWeight: 700 }}>
                    {r.jenis === "quran" ? "QURAN" : "HADITS"}
                  </span>
                  <span style={{ color: tema?.aksen, fontSize: 12, fontWeight: 700 }}>{r.sumber}</span>
                </div>
                {r.arab && <div style={{ color: t.teks, fontSize: 17, lineHeight: 1.9, textAlign: "right", fontFamily: "Georgia, serif", marginBottom: 6, direction: "rtl" }}>{r.arab}</div>}
                <div style={{ color: t.teks, fontSize: 14, lineHeight: 1.6, fontStyle: "italic", marginBottom: 8 }}>"{r.arti}"</div>
                <div style={{ color: t.subteks, fontSize: 12, lineHeight: 1.5, borderTop: `1px solid ${t.border}`, paddingTop: 8 }}>💡 {r.relevansi}</div>
              </div>
            ))}
            <div style={{ color: t.muted, fontSize: 11, textAlign: "center" }}>Pastikan validasi ke sumber terpercaya (quran.com / hadits.id).</div>
          </div>
        </div>
      )}
    </>
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
      const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
      setData(parsed);
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
