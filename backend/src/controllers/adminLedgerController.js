import { pool } from "../database/DBConnection.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { String as C } from "../utils/Constant.js";

// ─── GET /api/admin/ledger/summary ───────────────────────────────────────────
export const getLedgerSummary = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        la.account_type,
        la.owner_type,
        COALESCE(SUM(CASE WHEN le.credit_account_id = la.id THEN le.amount ELSE 0 END), 0)
          - COALESCE(SUM(CASE WHEN le.debit_account_id = la.id THEN le.amount ELSE 0 END), 0)
          AS balance
      FROM ${C.LEDGER_ACCOUNT} la
      LEFT JOIN ${C.LEDGER_ENTRY} le
        ON le.credit_account_id = la.id OR le.debit_account_id = la.id
      GROUP BY la.id, la.account_type, la.owner_type
      ORDER BY la.owner_type, la.account_type
    `);

    const summary = {
      platform_balances:    {},
      total_rider_credits:  0,
      total_driver_earnings: 0,
    };

    for (const row of rows) {
      const bal = parseFloat(row.balance);
      if (row.owner_type === "platform") {
        summary.platform_balances[row.account_type] = bal;
      } else if (row.owner_type === "user") {
        summary.total_rider_credits += bal;
      } else if (row.owner_type === "driver") {
        summary.total_driver_earnings += bal;
      }
    }

    res.status(200).json(ApiResponse.success(summary));
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/ledger/accounts ──────────────────────────────────────────
export const getLedgerAccounts = async (req, res, next) => {
  try {
    const { owner_type, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [parseInt(limit), offset];
    const where = owner_type ? `WHERE la.owner_type = $${params.push(owner_type)}` : "";

    const { rows } = await pool.query(`
      SELECT
        la.id, la.owner_type, la.owner_id, la.account_type, la.currency,
        COALESCE(SUM(CASE WHEN le.credit_account_id = la.id THEN le.amount ELSE 0 END), 0)
          - COALESCE(SUM(CASE WHEN le.debit_account_id = la.id THEN le.amount ELSE 0 END), 0)
          AS balance,
        la.created_at
      FROM ${C.LEDGER_ACCOUNT} la
      LEFT JOIN ${C.LEDGER_ENTRY} le
        ON le.credit_account_id = la.id OR le.debit_account_id = la.id
      ${where}
      GROUP BY la.id
      ORDER BY la.owner_type, la.account_type
      LIMIT $1 OFFSET $2
    `, params);

    res.status(200).json(ApiResponse.success(rows));
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/ledger/entries ───────────────────────────────────────────
export const getLedgerEntries = async (req, res, next) => {
  try {
    const { account_id, from, to, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [parseInt(limit), offset];
    const conditions = [];

    if (account_id) {
      conditions.push(`(le.debit_account_id = $${params.push(account_id)} OR le.credit_account_id = $${params.length})`);
    }
    if (from) conditions.push(`le.created_at >= $${params.push(from)}`);
    if (to)   conditions.push(`le.created_at <= $${params.push(to + " 23:59:59")}`);

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows } = await pool.query(`
      SELECT le.*,
             da.account_type AS debit_account_type,  da.owner_type AS debit_owner_type,
             ca.account_type AS credit_account_type, ca.owner_type AS credit_owner_type
      FROM ${C.LEDGER_ENTRY} le
      LEFT JOIN ${C.LEDGER_ACCOUNT} da ON da.id = le.debit_account_id
      LEFT JOIN ${C.LEDGER_ACCOUNT} ca ON ca.id = le.credit_account_id
      ${where}
      ORDER BY le.created_at DESC
      LIMIT $1 OFFSET $2
    `, params);

    res.status(200).json(ApiResponse.success(rows));
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/ledger/verify ────────────────────────────────────────────
// Double-entry check: sum(all credits) must equal sum(all debits)
export const verifyLedger = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COALESCE(SUM(amount), 0) AS total_debits,
        COALESCE(SUM(amount), 0) AS total_credits
      FROM ${C.LEDGER_ENTRY}
    `);

    // Each entry debits one account and credits another by the same amount
    // so total_debits and total_credits from a single SUM will always match.
    // What we actually check: sum of credit-side amounts = sum of debit-side amounts
    const { rows: check } = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN credit_account_id IS NOT NULL THEN amount ELSE 0 END), 0) AS total_credits,
        COALESCE(SUM(CASE WHEN debit_account_id  IS NOT NULL THEN amount ELSE 0 END), 0) AS total_debits
      FROM ${C.LEDGER_ENTRY}
    `);

    const credits     = parseFloat(check[0].total_credits);
    const debits      = parseFloat(check[0].total_debits);
    const discrepancy = Math.abs(credits - debits);
    const balanced    = discrepancy < 0.01;

    res.status(200).json(ApiResponse.success({
      balanced,
      total_credits: credits,
      total_debits:  debits,
      discrepancy,
    }));
  } catch (err) {
    next(err);
  }
};
