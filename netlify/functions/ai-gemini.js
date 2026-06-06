const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "GEMINI_API_KEY belum dikonfigurasi di Netlify." }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Request body tidak valid" }) };
  }

  const { mode, teks, pertanyaan, semuaCatatan } = body;

  if (!mode) {
    return { statusCode: 400, body: JSON.stringify({ error: "Field 'mode' wajib diisi" }) };
  }

  let prompt;
  if (mode === "rapikan") {
    if (!teks) return { statusCode: 400, body: JSON.stringify({ error: "Field 'teks' wajib untuk mode rapikan" }) };
    prompt = `Rapikan tulisan ini jadi catatan terstruktur dengan ejaan benar, tanpa mengubah makna. Balas hanya hasilnya:\n\n${teks}`;
  } else if (mode === "buatCatatan") {
    if (!teks) return { statusCode: 400, body: JSON.stringify({ error: "Field 'teks' wajib untuk mode buatCatatan" }) };
    prompt = `Ubah perintah ini jadi catatan/checklist terstruktur dalam bahasa Indonesia. Kalau ada nominal uang, tandai. Kalau ada tanggal, sebutkan. Balas ringkas:\n\n${teks}`;
  } else if (mode === "tanya") {
    if (!pertanyaan) return { statusCode: 400, body: JSON.stringify({ error: "Field 'pertanyaan' wajib untuk mode tanya" }) };
    const ringkasanCatatan = (semuaCatatan || [])
      .map(n => `[${n.judul}]: ${n.isi || (n.item||[]).map(i=>(i.cek?"✅":"☐")+" "+i.teks).join(", ")}`)
      .join("\n");
    prompt = `Berikut catatan user:\n${ringkasanCatatan}\n\nJawab pertanyaan ini berdasarkan catatan tersebut saja, ringkas dan akurat: ${pertanyaan}`;
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: `Mode '${mode}' tidak dikenal` }) };
  }

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini API error:", err);
      return { statusCode: 502, body: JSON.stringify({ error: "Gemini AI tidak merespons. Coba lagi." }) };
    }

    const data = await res.json();
    const hasil = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!hasil) return { statusCode: 502, body: JSON.stringify({ error: "AI tidak mengembalikan hasil." }) };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hasil }),
    };
  } catch (err) {
    console.error("ai-gemini error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Terjadi kesalahan internal." }) };
  }
};
