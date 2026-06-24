import { z } from "zod";

const nepaliPhone = z
  .string()
  .regex(/^\+977[0-9]{10}$/, "Phone must be in +977XXXXXXXXXX format");

export const sendOtpSchema = z.object({
  phone: nepaliPhone,
});

export const verifyOtpSchema = z.object({
  phone: nepaliPhone,
  otp:   z.string().length(6, "OTP must be 6 digits").regex(/^\d{6}$/),
  role:  z.enum(["rider", "driver"]).default("rider"),
  device_id:   z.string().max(255).optional(),
  device_name: z.string().max(255).optional(),
});

export const resendOtpSchema = z.object({
  phone: nepaliPhone,
});

export const loginSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1, "refresh_token required"),
});

export const registerDeviceSchema = z.object({
  fcm_token:   z.string().min(1),
  device_type: z.enum(["android", "ios", "web"]),
  device_id:   z.string().max(255).optional(),
  device_name: z.string().max(255).optional(),
});
