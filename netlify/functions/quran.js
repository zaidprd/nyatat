// Proxy ke alquran.cloud API. Terjemahan resmi Kemenag RI (edition id.indonesian).
// Tanpa AI — teks ayat & terjemahan otentik. Frontend: /.netlify/functions/quran?jenis=surat|ayat
const BASE = "https://api.alquran.cloud/v1";

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const { jenis, surat } = q;

  let url;
  if (jenis === "surat") {
    url = `${BASE}/surah`;
  } else if (jenis === "ayat") {
    if (!surat) return resp(400, { error: "Param 'surat' wajib" });
    url = `${BASE}/surah/${encodeURIComponent(surat)}/editions/quran-uthmani,id.indonesian`;
  } else {
    return resp(400, { error: "Param 'jenis' tidak valid (surat|ayat)" });
  }

  try {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) return resp(502, { error: "Sumber Al-Quran tidak merespons. Coba lagi." });
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=604800" },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return resp(502, { error: e.message || "Gagal mengambil data Al-Quran" });
  }
};

function resp(statusCode, obj) {
  return { statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) };
}
