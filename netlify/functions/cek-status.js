const midtransClient = require("midtrans-client");

exports.handler = async (event) => {
  try {
    const { order_id } = JSON.parse(event.body || "{}");
    if (!order_id) {
      return { statusCode: 200, body: JSON.stringify({ transaction_status: "not_found" }) };
    }
    const core = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });
    const status = await core.transaction.status(order_id);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transaction_status: status.transaction_status, order_id }),
    };
  } catch (err) {
    return { statusCode: 200, body: JSON.stringify({ transaction_status: "not_found" }) };
  }
};
