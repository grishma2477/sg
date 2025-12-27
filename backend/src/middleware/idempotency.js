import crypto from "crypto";
import { findOne, create } from "../database/utils/DBMethods.js";

export const idempotency = async (req, res, next) => {
  const key = req.headers["idempotency-key"];
  if (!key) return next();

  const existing = await findOne("idempotency_keys", { key });
  if (existing) {
    return res.status(409).json(existing.response);
  }

  res.on("finish", async () => {
    await create("idempotency_keys", {
      key,
      response: res.locals.response
    });
  });

  next();
};
