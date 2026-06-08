const midtransClient = require("midtrans-client");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ valid: false }) };
  }
  try {
    const { order_id, email } = JSON.parse(event.body);
    if (!order_id || !email) {
      return { statusCode: 200, body: JSON.stringify({
        valid: false, pesan: "Order ID dan email wajib diisi"
      })};
    }

    const core = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const status = await core.transaction.status(order_id);

    const transaksiValid =
      (status.transaction_status === "settlement" ||
       status.transaction_status === "capture") &&
      (status.fraud_status === "accept" || !status.fraud_status);

    if (!transaksiValid) {
      return { statusCode: 200, body: JSON.stringify({
        valid: false, pesan: "Transaksi tidak ditemukan atau belum lunas"
      })};
    }

    const emailMidtrans = status.customer_details?.email || status.email || "";
    const emailCocok = emailMidtrans.toLowerCase().trim() === email.toLowerCase().trim();

    if (!emailCocok) {
      return { statusCode: 200, body: JSON.stringify({
        valid: false, pesan: "Email tidak cocok dengan data pembelian"
      })};
    }

    return { statusCode: 200, body: JSON.stringify({
      valid: true,
      pesan: "Verifikasi berhasil! Pro aktif kembali.",
    })};
  } catch (err) {
    console.error("Reaktivasi error:", err);
    return { statusCode: 200, body: JSON.stringify({
      valid: false,
      pesan: "Order ID tidak ditemukan. Pastikan Order ID benar.",
    })};
  }
};
