const crypto = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const notif = JSON.parse(event.body);
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    // Verifikasi signature
    const { order_id, status_code, gross_amount, signature_key } = notif;
    const hash = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (hash !== signature_key) {
      return { statusCode: 403, body: JSON.stringify({ error: "Invalid signature" }) };
    }

    // Cek status transaksi
    const { transaction_status, fraud_status } = notif;
    let statusFinal = "pending";

    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        statusFinal = "sukses";
      }
    } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
      statusFinal = "gagal";
    }

    console.log(`Webhook ${order_id}: ${transaction_status} → ${statusFinal}`);

    // Selalu return 200 ke Midtrans biar tidak retry
    return {
      statusCode: 200,
      body: JSON.stringify({ status: "ok", order_id, statusFinal }),
    };
  } catch (err) {
    console.error("Webhook error:", err);
    return { statusCode: 200, body: JSON.stringify({ status: "error" }) };
  }
};
