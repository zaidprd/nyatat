const crypto = require("crypto");

exports.handler = async (event) => {
  // Health check / verifikasi URL oleh Midtrans
  if (event.httpMethod === "GET" || !event.body) {
    return { statusCode: 200, body: JSON.stringify({ status: "ok" }) };
  }

  try {
    const notif = JSON.parse(event.body);
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const { order_id, status_code, gross_amount, signature_key,
            transaction_status, fraud_status } = notif;

    const hash = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (hash !== signature_key) {
      return { statusCode: 200, body: JSON.stringify({ status: "invalid_signature" }) };
    }

    if (order_id && order_id.startsWith("KAPURPAD-")) {
      if ((transaction_status === "capture" || transaction_status === "settlement")
          && (fraud_status === "accept" || !fraud_status)) {
        console.log("KapurPad Pro PAID:", order_id);
      }
    }

    return { statusCode: 200, body: JSON.stringify({ status: "ok" }) };
  } catch (err) {
    return { statusCode: 200, body: JSON.stringify({ status: "ok" }) };
  }
};
