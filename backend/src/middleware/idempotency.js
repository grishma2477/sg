// import crypto from "crypto";
// import { findOne, create } from "../database/utils/DBMethods.js";

// export const idempotency = async (req, res, next) => {
//   const key = req.headers["idempotency-key"];
//   if (!key) return next();

//   const existing = await findOne("idempotency_keys", { key });
//   if (existing) {
//     return res.status(409).json(existing.response);
//   }

//   const originalJson = res.json;

//   res.json = function (body) {
//     res.locals.response = body;
//     return originalJson.call(this, body);
//   };

//   res.on("finish", async () => {
//     await create("idempotency_keys", {
//       key,
//       response: res.locals.response
//     });
//   });

//   next();
// };


import crypto from "crypto";
import IdempotencyKey from "../models/idempotency/IdempotencyKey.js";


export const idempotency = async (req, res, next) => {

  const key = req.headers["idempotency-key"];
  if (!key) return next();

  const method = req.method;
  const path = req.originalUrl;

  const requestHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(req.body || {}))
    .digest("hex");

  const existing = await IdempotencyKey.findOne({
    key,
    method,
    path
  });

  if (existing) {

    if (existing.request_hash !== requestHash) {
      return res.status(409).json({
        error: "IDEMPOTENCY_KEY_BODY_MISMATCH"
      });
    }

    return res.status(200).json(existing.response);
  }

  const originalJson = res.json;

  res.json = async function (body) {

    await IdempotencyKey.create({
      key,
      method,
      path,
      request_hash: requestHash,
      response: body
    });

    return originalJson.call(this, body);
  };

  next();
};