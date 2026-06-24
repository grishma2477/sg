import crypto from "crypto";
import redis from "./redisClient.js";

const OTP_TTL_SECONDS = 300;      // 5 minutes
const MAX_ATTEMPTS    = 3;

// ─── OTP helpers ────────────────────────────────────────────────────────────

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeOTP(phone, otp) {
  const key = `otp:${phone}`;
  await redis.set(key, JSON.stringify({ otp, attempts: 0 }), "EX", OTP_TTL_SECONDS);
}

export async function verifyOTP(phone, otp) {
  const key = `otp:${phone}`;
  const raw = await redis.get(key);
  if (!raw) return { valid: false, reason: "OTP_EXPIRED" };

  const record = JSON.parse(raw);

  if (record.attempts >= MAX_ATTEMPTS) {
    await redis.del(key);
    return { valid: false, reason: "TOO_MANY_ATTEMPTS" };
  }

  if (record.otp !== otp) {
    record.attempts += 1;
    await redis.set(key, JSON.stringify(record), "KEEPTTL");
    return { valid: false, reason: "INVALID_OTP" };
  }

  await redis.del(key);
  return { valid: true };
}

export async function deleteOTP(phone) {
  await redis.del(`otp:${phone}`);
}

// ─── SMS providers ───────────────────────────────────────────────────────────

async function sendViaSparrow(phone, message) {
  const token = process.env.SPARROW_SMS_TOKEN;
  const from  = process.env.SPARROW_SMS_FROM || "SG";
  if (!token) throw new Error("SPARROW_SMS_TOKEN not set");

  const url = new URL("http://api.sparrowsms.com/v2/sms/");
  url.searchParams.set("token", token);
  url.searchParams.set("from", from);
  url.searchParams.set("to", phone);
  url.searchParams.set("text", message);

  const resp = await fetch(url.toString());
  const body = await resp.json().catch(() => ({}));

  if (!resp.ok || body.response_code !== 200) {
    throw new Error(`Sparrow SMS error: ${JSON.stringify(body)}`);
  }
  return body;
}

async function sendViaTwilio(phone, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || !from) throw new Error("Twilio env vars not set");

  const { default: twilio } = await import("twilio");
  const client = twilio(accountSid, authToken);
  return client.messages.create({ body: message, from, to: phone });
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function sendOTP(phone, otp) {
  const message = `Your SG verification code is ${otp}. Valid for 5 minutes. Do not share it.`;

  try {
    await sendViaSparrow(phone, message);
    return { provider: "sparrow" };
  } catch (sparrowErr) {
    console.warn("⚠️  Sparrow SMS failed, trying Twilio:", sparrowErr.message);
    try {
      await sendViaTwilio(phone, message);
      return { provider: "twilio" };
    } catch (twilioErr) {
      console.error("❌ Twilio also failed:", twilioErr.message);
      throw new Error("SMS_SEND_FAILED");
    }
  }
}
