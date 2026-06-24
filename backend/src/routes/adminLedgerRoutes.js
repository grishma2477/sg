import express from "express";
import { verifyuser } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  getLedgerSummary,
  getLedgerAccounts,
  getLedgerEntries,
  verifyLedger,
} from "../controllers/adminLedgerController.js";

const router = express.Router();

router.use(verifyuser, requireRole("admin"));

router.get("/summary",  getLedgerSummary);
router.get("/accounts", getLedgerAccounts);
router.get("/entries",  getLedgerEntries);
router.get("/verify",   verifyLedger);

export default router;
