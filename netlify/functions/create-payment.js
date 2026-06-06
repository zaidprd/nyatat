const midtransClient = require("midtrans-client");

// Harga tunggal: Pro seumur hidup (lifetime) Rp 25.000.
const HARGA_PRO = 25000;
const PLAN_AMOUNT = {
  seumur: HARGA_PRO,
  // Alias lama agar order yang sudah terlanjur terkirim tetap valid.
  tahunan: HARGA_PRO,
  bulanan: HARGA_PRO,
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Request body tidak valid" }) };
  }

  const { plan, order_id } = body;

  if (!plan || !order_id) {
    return { statusCode: 400, body: JSON.stringify({ error: "plan dan order_id wajib diisi" }) };
  }

  const amount = PLAN_AMOUNT[plan];
  if (!amount) {
    return { statusCode: 400, body: JSON.stringify({ error: "plan tidak valid, gunakan 'seumur'" }) };
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server key Midtrans belum dikonfigurasi" }) };
  }

  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const snap = new midtransClient.Snap({
    isProduction: isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
  });

  const parameter = {
    transaction_details: {
      order_id,
      gross_amount: amount,
    },
    item_details: [
      {
        id: plan,
        price: amount,
        quantity: 1,
        name: "KapurPad Pro — Seumur Hidup",
      },
    ],
    credit_card: { secure: true },
    callbacks: {
      finish: "https://nyatat.netlify.app",
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: transaction.token, redirect_url: transaction.redirect_url }),
    };
  } catch (err) {
    console.error("Midtrans error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Gagal membuat transaksi Midtrans" }),
    };
  }
};
