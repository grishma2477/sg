import crypto from "crypto";
import { pool } from "../../database/DBConnection.js";

const BASE_URL    = () => process.env.ESEWA_BASE_URL    || "https://rc-epay.esewa.com.np";
const MERCHANT    = () => process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
const SECRET_KEY  = () => process.env.ESEWA_SECRET_KEY   || "8gBm/:&EnhH.1/q";

function hmac(message) {
  return crypto
    .createHmac("sha256", SECRET_KEY())
    .update(message)
    .digest("base64");
}

// ─── Initiate ────────────────────────────────────────────────────────────────

export function initiateTopup({ amount, transactionUuid, successUrl, failureUrl }) {
  const totalAmount  = Number(amount).toFixed(2);
  const productCode  = MERCHANT();
  const signedFields = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const signature    = hmac(signedFields);

  return {
    paymentUrl: `${BASE_URL()}/api/epay/main/v2/form`,
    formFields: {
      amount:           totalAmount,
      tax_amount:       "0",
      total_amount:     totalAmount,
      transaction_uuid: transactionUuid,
      product_code:     productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url:      successUrl,
      failure_url:      failureUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
    },
  };
}

// ─── Webhook verification ─────────────────────────────────────────────────────

export function verifyWebhook(decodedData) {
  // decodedData is the JSON-parsed base64 body from eSewa
  const { transaction_code, status, total_amount, transaction_uuid,
          product_code, signed_field_names, signature } = decodedData;

  const fields    = signed_field_names.split(",");
  const message   = fields.map((f) => `${f}=${decodedData[f]}`).join(",");
  const expected  = hmac(message);

  if (expected !== signature) return { valid: false, reason: "SIGNATURE_MISMATCH" };
  if (status !== "COMPLETE")  return { valid: false, reason: "PAYMENT_INCOMPLETE" };
  if (product_code !== MERCHANT()) return { valid: false, reason: "MERCHANT_MISMATCH" };

  return { valid: true, transactionUuid: transaction_uuid, gatewayTxnId: transaction_code, amount: parseFloat(total_amount) };
}

// ─── Look up a pending topup by transaction_uuid ─────────────────────────────

export async function getPendingTopup(transactionUuid) {
  const { rows } = await pool.query(
    `SELECT * FROM wallet_topups WHERE transaction_uuid = $1 AND provider = 'esewa'`,
    [transactionUuid]
  );
  return rows[0] ?? null;
}
