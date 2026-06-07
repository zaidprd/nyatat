// Proxy ke HadeethEnc.com API (Ensiklopedia Hadits Nabawi).
// Sumber hanya memuat hadits SHAHIH/HASAN — sesuai manhaj, tanpa AI, tanpa risiko halusinasi.
// Frontend memanggil: /.netlify/functions/hadits?jenis=kategori | daftar | satu
const BASE = "https://hadeethenc.com/api/v1";
const L = "id"; // bahasa Indonesia

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const { jenis, id, kategori, page } = q;

  let url;
  if (jenis === "kategori") {
    url = `${BASE}/categories/list/?language=${L}`;
  } else if (jenis === "daftar") {
    if (!kategori) return resp(400, { error: "Param 'kategori' wajib" });
    url = `${BASE}/hadeeths/list/?language=${L}&category_id=${encodeURIComponent(kategori)}&page=${encodeURIComponent(page || 1)}&per_page=30`;
  } else if (jenis === "satu") {
    if (!id) return resp(400, { error: "Param 'id' wajib" });
    url = `${BASE}/hadeeths/one/?language=${L}&id=${encodeURIComponent(id)}`;
  } else {
    return resp(400, { error: "Param 'jenis' tidak valid (kategori|daftar|satu)" });
  }

  try {
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) return resp(502, { error: "Sumber hadits tidak merespons. Coba lagi." });
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=86400" },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return resp(502, { error: e.message || "Gagal mengambil data hadits" });
  }
};

function resp(statusCode, obj) {
  return { statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) };
}
