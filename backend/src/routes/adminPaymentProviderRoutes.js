import express from "express";
import { verifyuser } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createProvider,
  updateProvider,
  deactivateProvider,
  getProviders
} from "../controllers/adminPaymentProviderController.js";

const router = express.Router();

router.use(verifyuser);
router.use(requireRole("admin"));

router.post("/", createProvider);
router.get("/", getProviders);
router.put("/:id", updateProvider);
router.patch("/:id/deactivate", deactivateProvider);

export default router;