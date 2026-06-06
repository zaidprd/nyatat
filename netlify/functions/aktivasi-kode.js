exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ valid: false }) };
  }
  try {
    const { kode } = JSON.parse(event.body || "{}");

    // Kode valid disimpan di ENV VARIABLE (rahasia, tidak ada di source frontend)
    const kodeValid = (process.env.KODE_AKTIVASI || "").split(",").map(k => k.trim()).filter(Boolean);

    if (kode && kodeValid.includes(kode.trim())) {
      return {
        statusCode: 200,
        body: JSON.stringify({ valid: true, durasi: "lifetime" }),
      };
    }
    return { statusCode: 200, body: JSON.stringify({ valid: false }) };
  } catch {
    return { statusCode: 200, body: JSON.stringify({ valid: false }) };
  }
};
