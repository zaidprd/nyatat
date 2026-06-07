// Backend AI via Cloudflare Workers AI (model Llama 3.1 8B Instruct).
// Endpoint frontend: "/.netlify/functions/ai-asisten".

const CF_MODEL = "@cf/meta/llama-3.1-8b-instruct";

const SYSTEM_PROMPT = {
  rapikan:
    "Kamu asisten yang merapikan tulisan jadi catatan terstruktur dengan ejaan benar dalam bahasa Indonesia. Balas hanya hasil rapihnya tanpa basa-basi.",
  buatCatatan:
    "Kamu asisten yang mengubah perintah bebas jadi catatan/checklist terstruktur bahasa Indonesia. Tandai nominal uang dan tanggal jika ada. Balas ringkas.",
  ringkasanVoice:
    "Kamu asisten yang merapikan hasil transkripsi suara (voice-to-text) menjadi catatan tertulis yang rapi, ejaan benar, dan terstruktur dalam bahasa Indonesia. Tambahkan paragraf/pemisah sesuai konteks. Balas HANYA catatan hasilnya saja.",
  ringkasanOCR:
    "Kamu asisten yang merapikan teks hasil OCR (scan tulisan tangan/tulisan di foto) menjadi catatan tertulis rapi dengan ejaan benar dalam bahasa Indonesia. Koreksi OCR yang salah, pertahankan nama/orang/tempat/angka penting. Balas HANYA catatan hasilnya saja.",
  weeklyInsight:
    "Kamu asisten yang menganalisis catatan user selama satu minggu dan memberikan insight personal. " +
    "Bahasamu hangat, suportif, seperti teman dekat. Gunakan emoji secukupnya. " +
    "Format respons dalam 4 bagian TANPA markdown heading (##) tapi boleh bullet:\n" +
    "1) RINGKASAN MINGGU INI (2-3 kalimat, nada hangat)\n" +
    "2) POLA & MOMEN PENTING (3-5 bullet, temuan menarik)\n" +
    "3) 3 TOPIK TERBAIK (judul catatan terbaik + 1 kalimat kenapa menarik)\n" +
    "4) SARAN UNTUK MINGGU DEPAN (2-3 saran konkret). Jawab dalam bahasa Indonesia.",
  quranRef:
    "Kamu asisten yang merekomendasikan ayat Al-Quran atau hadits yang relevan dengan topik catatan user. " +
    "Jawab dalam format JSON valid saja (TANPA markdown, TANPA backtick): " +
    '{"rekomendasi":[{"jenis":"quran|hadits","sumber":"Nama surah:ayat atau Perawi | Kitab","arab":"","arti":"terjemahan bahasa Indonesia","relevansi":"1-2 kalimat kenapa relevan dengan catatan"}]}. ' +
    "Maksimal 3 rekomendasi. Utamakan yang paling dikenal. Selalu isi field 'arab' dengan string kosong \"\" karena kamu belum tentu hafal.",
  smartReminder:
    "Kamu asisten yang menganalisis catatan user dan menghasilkan pengingat kontekstual yang actionable. " +
    "Jawab dalam format JSON valid saja (TANPA markdown, TANPA backtick): " +
    '{"pengingat":[{"judul":"judul pengingat singkat (maks 6 kata)","deskripsi":"1-2 kalimat konteks kenapa penting","icon":"emoji 1 karakter","kategori":"ibadah|keuangan|kesehatan|kerja|sosial|lainnya"}]}. ' +
    "Maksimal 5 pengingat. Hanya yang bernilai.",
  ringkasanJudul:
    "Kamu asisten yang membuat judul catatan pendek (maks 5 kata) dan rapi. Balas HANYA judulnya saja, tanpa tanda kutip, tanpa penjelasan.",
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken  = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    return { statusCode: 500, body: JSON.stringify({ error: "CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN belum dikonfigurasi di Netlify." }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Request body tidak valid" }) };
  }

  const { mode, teks, pertanyaan, semuaCatatan } = body;

  if (!mode) {
    return { statusCode: 400, body: JSON.stringify({ error: "Field 'mode' wajib diisi" }) };
  }

  let messages;
  if (mode === "rapikan") {
    if (!teks) return { statusCode: 400, body: JSON.stringify({ error: "Field 'teks' wajib untuk mode rapikan" }) };
    messages = [
      { role: "system", content: SYSTEM_PROMPT.rapikan },
      { role: "user", content: teks },
    ];
  } else if (mode === "buatCatatan") {
    if (!teks) return { statusCode: 400, body: JSON.stringify({ error: "Field 'teks' wajib untuk mode buatCatatan" }) };
    messages = [
      { role: "system", content: SYSTEM_PROMPT.buatCatatan },
      { role: "user", content: teks },
    ];
  } else if (mode === "tanya") {
    if (!pertanyaan) return { statusCode: 400, body: JSON.stringify({ error: "Field 'pertanyaan' wajib untuk mode tanya" }) };
    const ringkasanCatatan = (semuaCatatan || [])
      .map(n => `[${n.judul}]: ${n.isi || (n.item||[]).map(i=>(i.cek?"\u2705":"\u2610")+" "+i.teks).join(", ")}`)
      .join("\n");
    messages = [
      { role: "system", content: `Kamu asisten yang menjawab pertanyaan berdasarkan catatan user. Jawab ringkas dan akurat dalam bahasa Indonesia. Berikut catatan user:\n${ringkasanCatatan}` },
      { role: "user", content: pertanyaan },
    ];
  } else if (mode === "ringkasanVoice") {
    if (!teks) return { statusCode: 400, body: JSON.stringify({ error: "Field 'teks' wajib untuk mode ringkasanVoice" }) };
    messages = [
      { role: "system", content: SYSTEM_PROMPT.ringkasanVoice },
      { role: "user", content: teks },
    ];
  } else if (mode === "ringkasanOCR") {
    if (!teks) return { statusCode: 400, body: JSON.stringify({ error: "Field 'teks' wajib untuk mode ringkasanOCR" }) };
    messages = [
      { role: "system", content: SYSTEM_PROMPT.ringkasanOCR },
      { role: "user", content: teks },
    ];
  } else if (mode === "weeklyInsight") {
    if (!semuaCatatan) return { statusCode: 400, body: JSON.stringify({ error: "Field 'semuaCatatan' wajib untuk mode weeklyInsight" }) };
    const ringkasanCatatan = (semuaCatatan || [])
      .map(n => `[${n.judul}] (${new Date(n.diubah||n.dibuat).toLocaleDateString("id-ID")}): ${n.isi || (n.item||[]).map(i=>(i.cek?"\u2705":"\u2610")+" "+i.teks).join(", ")}`)
      .join("\n");
    messages = [
      { role: "system", content: `${SYSTEM_PROMPT.weeklyInsight}\n\nBerikut catatan user selama 1 minggu terakhir:\n${ringkasanCatatan}` },
      { role: "user", content: "Berikan insight mingguan berdasarkan catatan di atas." },
    ];
  } else if (mode === "quranRef") {
    if (!teks) return { statusCode: 400, body: JSON.stringify({ error: "Field 'teks' wajib untuk mode quranRef" }) };
    messages = [
      { role: "system", content: SYSTEM_PROMPT.quranRef },
      { role: "user", content: `Topik catatan: ${teks}` },
    ];
  } else if (mode === "smartReminder") {
    if (!semuaCatatan) return { statusCode: 400, body: JSON.stringify({ error: "Field 'semuaCatatan' wajib untuk mode smartReminder" }) };
    const ringkasanCatatan = (semuaCatatan || [])
      .map(n => `[${n.judul}]: ${n.isi || (n.item||[]).map(i=>(i.cek?"\u2705":"\u2610")+" "+i.teks).join(", ")}`)
      .join("\n");
    messages = [
      { role: "system", content: `${SYSTEM_PROMPT.smartReminder}\n\nBerikut catatan user:\n${ringkasanCatatan}` },
      { role: "user", content: "Berikan pengingat kontekstual yang bermanfaat." },
    ];
  } else if (mode === "ringkasanJudul") {
    if (!teks) return { statusCode: 400, body: JSON.stringify({ error: "Field 'teks' wajib untuk mode ringkasanJudul" }) };
    messages = [
      { role: "system", content: SYSTEM_PROMPT.ringkasanJudul },
      { role: "user", content: teks },
    ];
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: `Mode '${mode}' tidak dikenal` }) };
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CF_MODEL}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Cloudflare AI error:", err);
      return { statusCode: 502, body: JSON.stringify({ error: "Asisten AI tidak merespons. Coba lagi." }) };
    }

    const data = await res.json();
    const hasil = (data?.result?.response || "").trim();
    if (!hasil) return { statusCode: 502, body: JSON.stringify({ error: "AI tidak mengembalikan hasil." }) };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hasil }),
    };
  } catch (err) {
    console.error("ai-asisten error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Terjadi kesalahan internal." }) };
  }
};
