// Backend AI via Cloudflare Workers AI (model Llama 3.1 8B Instruct).
// Endpoint frontend: "/.netlify/functions/ai-asisten".

const CF_MODEL = "@cf/meta/llama-3.1-8b-instruct";

const SYSTEM_PROMPT = {
  rapikan:
    "Kamu asisten yang merapikan tulisan jadi catatan terstruktur dengan ejaan benar dalam bahasa Indonesia. Balas hanya hasil rapihnya tanpa basa-basi.",
  buatCatatan:
    "Kamu asisten yang mengubah perintah bebas jadi catatan/checklist terstruktur bahasa Indonesia. Tandai nominal uang dan tanggal jika ada. Balas ringkas.",
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
      .map(n => `[${n.judul}]: ${n.isi || (n.item||[]).map(i=>(i.cek?"✅":"☐")+" "+i.teks).join(", ")}`)
      .join("\n");
    messages = [
      { role: "system", content: `Kamu asisten yang menjawab pertanyaan berdasarkan catatan user. Jawab ringkas dan akurat dalam bahasa Indonesia. Berikut catatan user:\n${ringkasanCatatan}` },
      { role: "user", content: pertanyaan },
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
    // Cloudflare Workers AI menaruh hasil di data.result.response (BUKAN data.candidates)
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
