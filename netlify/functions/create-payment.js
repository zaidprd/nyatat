const midtransClient = require("midtrans-client");

const PLAN_AMOUNT = {
  tahunan: 99000,
  bulanan: 24000,
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
    return { statusCode: 400, body: JSON.stringify({ error: "plan tidak valid, gunakan 'tahunan' atau 'bulanan'" }) };
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server key Midtrans belum dikonfigurasi" }) };
  }

  const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey,
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
        name: plan === "tahunan" ? "KapurPad Pro — Tahunan" : "KapurPad Pro — Bulanan",
      },
    ],
    credit_card: { secure: true },
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
