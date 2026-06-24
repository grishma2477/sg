import crypto from "crypto";
import { pool } from "../database/DBConnection.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { WalletService } from "../application/services/WalletService.js";
import { initiateTopup as esewaInitiate, verifyWebhook as esewaVerifyWebhook, getPendingTopup as esewaGetPending } from "../infrastructure/payment-providers/esewaClient.js";
import { initiateTopup as khaltiInitiate, verifyPayment as khaltiVerify, getPendingTopup as khaltiGetPending } from "../infrastructure/payment-providers/khaltiClient.js";

// ─── POST /api/wallet/topup/initiate ─────────────────────────────────────────
export const initiateTopup = async (req, res, next) => {
  try {
    const { amount, provider, return_url } = req.body;
    const userId = req.user.id;

    if (!amount || amount < 10) {
      return res.status(400).json(ApiResponse.error("Minimum top-up is NPR 10", 400));
    }
    if (!["esewa", "khalti"].includes(provider)) {
      return res.status(400).json(ApiResponse.error("provider must be esewa or khalti", 400));
    }

    const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const successUrl = return_url || `${baseUrl}/api/wallet/topup/verify`;
    const failureUrl = return_url || `${baseUrl}/api/wallet/topup/failed`;

    if (provider === "esewa") {
      const transactionUuid = crypto.randomUUID();

      await pool.query(
        `INSERT INTO wallet_topups (user_id, amount, provider, transaction_uuid, status)
         VALUES ($1, $2, 'esewa', $3, 'pending')`,
        [userId, amount, transactionUuid]
      );

      const payload = esewaInitiate({ amount, transactionUuid, successUrl, failureUrl });

      return res.status(200).json(ApiResponse.success({
        provider: "esewa",
        transactionUuid,
        ...payload,
      }, "TOPUP_INITIATED"));
    }

    // Khalti
    const purchaseOrderId = `sg-topup-${crypto.randomUUID()}`;
    const { pidx, paymentUrl } = await khaltiInitiate({
      amount,
      purchaseOrderId,
      returnUrl: successUrl,
    });

    await pool.query(
      `INSERT INTO wallet_topups (user_id, amount, provider, pidx, status)
       VALUES ($1, $2, 'khalti', $3, 'pending')`,
      [userId, amount, pidx]
    );

    res.status(200).json(ApiResponse.success({
      provider: "khalti",
      pidx,
      paymentUrl,
    }, "TOPUP_INITIATED"));
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/wallet/topup/verify ───────────────────────────────────────────
// Called by the frontend after Khalti redirects back with ?pidx=...
export const verifyTopup = async (req, res, next) => {
  try {
    const { provider, pidx } = req.body;
    const userId = req.user.id;

    if (provider !== "khalti" || !pidx) {
      return res.status(400).json(ApiResponse.error("provider=khalti and pidx required", 400));
    }

    const topup = await khaltiGetPending(pidx);
    if (!topup) {
      return res.status(404).json(ApiResponse.error("TOPUP_NOT_FOUND", 404));
    }
    if (topup.user_id !== userId) {
      return res.status(403).json(ApiResponse.error("FORBIDDEN", 403));
    }
    if (topup.status === "completed") {
      return res.status(200).json(ApiResponse.success({ alreadyCompleted: true }, "ALREADY_COMPLETED"));
    }

    const verification = await khaltiVerify(pidx);
    if (!verification.valid) {
      await pool.query(
        `UPDATE wallet_topups SET status='failed', gateway_response=$1, updated_at=NOW() WHERE pidx=$2`,
        [JSON.stringify(verification.raw), pidx]
      );
      return res.status(400).json(ApiResponse.error("PAYMENT_NOT_COMPLETED", 400));
    }

    // Credit wallet
    await WalletService.topUpWallet({
      userId,
      amount: parseFloat(topup.amount),
      paymentMethod: "khalti",
      paymentGateway: "khalti",
      gatewayTransactionId: verification.gatewayTxnId,
      metadata: { pidx },
    });

    await pool.query(
      `UPDATE wallet_topups
       SET status='completed', gateway_transaction_id=$1, gateway_response=$2, updated_at=NOW()
       WHERE pidx=$3`,
      [verification.gatewayTxnId, JSON.stringify(verification.raw), pidx]
    );

    res.status(200).json(ApiResponse.success({
      amount: parseFloat(topup.amount),
      provider: "khalti",
    }, "TOPUP_COMPLETED"));
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/payments/webhook/esewa ────────────────────────────────────────
// No auth — secured by HMAC signature verification
export const handleEsewaWebhook = async (req, res, next) => {
  try {
    // eSewa sends base64-encoded JSON in req.body.data
    const rawData = req.body?.data;
    if (!rawData) return res.status(400).json({ error: "NO_DATA" });

    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(rawData, "base64").toString("utf8"));
    } catch {
      return res.status(400).json({ error: "INVALID_PAYLOAD" });
    }

    const verification = esewaVerifyWebhook(decoded);
    if (!verification.valid) {
      return res.status(400).json({ error: verification.reason });
    }

    const topup = await esewaGetPending(verification.transactionUuid);
    if (!topup) return res.status(404).json({ error: "TOPUP_NOT_FOUND" });

    // Idempotency — already processed
    if (topup.status === "completed") return res.status(200).json({ ok: true });

    await WalletService.topUpWallet({
      userId: topup.user_id,
      amount: parseFloat(topup.amount),
      paymentMethod: "esewa",
      paymentGateway: "esewa",
      gatewayTransactionId: verification.gatewayTxnId,
      metadata: { transactionUuid: verification.transactionUuid },
    });

    await pool.query(
      `UPDATE wallet_topups
       SET status='completed', gateway_transaction_id=$1, gateway_response=$2, updated_at=NOW()
       WHERE transaction_uuid=$3`,
      [verification.gatewayTxnId, JSON.stringify(decoded), verification.transactionUuid]
    );

    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/wallet/topup/status/:topupId ───────────────────────────────────
export const getTopupStatus = async (req, res, next) => {
  try {
    const { topupId } = req.params;
    const userId = req.user.id;

    const { rows } = await pool.query(
      `SELECT id, amount, provider, status, created_at, updated_at
       FROM wallet_topups WHERE id=$1 AND user_id=$2`,
      [topupId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json(ApiResponse.error("TOPUP_NOT_FOUND", 404));
    }

    res.status(200).json(ApiResponse.success(rows[0]));
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/wallet/statement ───────────────────────────────────────────────
export const getWalletStatement = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { from, to, page = 1, limit = 30 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [userId, parseInt(limit), offset];
    const conditions = ["user_id = $1"];

    if (from) { conditions.push(`created_at >= $${params.push(from)}`); }
    if (to)   { conditions.push(`created_at <= $${params.push(to + " 23:59:59")}`); }

    const { rows } = await pool.query(
      `SELECT id, type, category, amount, currency, balance_before, balance_after,
              status, payment_method, description, created_at
       FROM transactions
       WHERE ${conditions.join(" AND ")}
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      params
    );

    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM transactions WHERE ${conditions.join(" AND ")}`,
      [userId, ...params.slice(3)]
    );

    res.status(200).json(ApiResponse.success({
      transactions: rows,
      pagination: {
        page:  parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countRows[0].count),
      },
    }));
  } catch (err) {
    next(err);
  }
};
