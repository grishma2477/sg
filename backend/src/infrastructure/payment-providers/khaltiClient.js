import { pool } from "../../database/DBConnection.js";

const BASE_URL   = () => process.env.KHALTI_BASE_URL  || "https://a.khalti.com";
const SECRET_KEY = () => process.env.KHALTI_SECRET_KEY || "";

function khaltiHeaders() {
  return {
    Authorization: `Key ${SECRET_KEY()}`,
    "Content-Type": "application/json",
  };
}

// ─── Initiate ────────────────────────────────────────────────────────────────

export async function initiateTopup({ amount, purchaseOrderId, purchaseOrderName, returnUrl, websiteUrl }) {
  if (!SECRET_KEY()) throw new Error("KHALTI_SECRET_KEY not set");

  const resp = await fetch(`${BASE_URL()}/api/v2/epayment/initiate/`, {
    method:  "POST",
    headers: khaltiHeaders(),
    body: JSON.stringify({
      return_url:          returnUrl,
      website_url:         websiteUrl || returnUrl,
      amount:              Math.round(amount * 100), // paisa
      purchase_order_id:   purchaseOrderId,
      purchase_order_name: purchaseOrderName || `SG Wallet Top-up NPR ${amount}`,
    }),
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.detail || "KHALTI_INITIATE_FAILED");

  return { pidx: data.pidx, paymentUrl: data.payment_url };
}

// ─── Verify / lookup ─────────────────────────────────────────────────────────

export async function verifyPayment(pidx) {
  if (!SECRET_KEY()) throw new Error("KHALTI_SECRET_KEY not set");

  const resp = await fetch(`${BASE_URL()}/api/v2/epayment/lookup/`, {
    method:  "POST",
    headers: khaltiHeaders(),
    body: JSON.stringify({ pidx }),
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data?.detail || "KHALTI_LOOKUP_FAILED");

  // data.status: "Completed" | "Pending" | "Refunded" | "Expired" | "User canceled" | "Partially Refunded"
  return {
    valid:            data.status === "Completed",
    status:           data.status,
    amount:           data.total_amount ? data.total_amount / 100 : null, // back to NPR
    gatewayTxnId:     data.transaction_id ?? null,
    raw:              data,
  };
}

// ─── Look up a pending topup by pidx ─────────────────────────────────────────

export async function getPendingTopup(pidx) {
  const { rows } = await pool.query(
    `SELECT * FROM wallet_topups WHERE pidx = $1 AND provider = 'khalti'`,
    [pidx]
  );
  return rows[0] ?? null;
}
