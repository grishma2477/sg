import { z } from "zod";

export const topupSchema = z.object({
  amount:         z.number().positive().min(10, "Minimum top-up is NPR 10"),
  payment_method: z.enum(["esewa", "khalti", "card"]),
  gateway_ref:    z.string().max(255).optional(),
});

export const withdrawSchema = z.object({
  amount:          z.number().positive().min(100, "Minimum withdrawal is NPR 100"),
  bank_account_id: z.string().uuid("Invalid bank account ID"),
});

export const transferSchema = z.object({
  recipient_phone: z.string().regex(/^\+977[0-9]{10}$/),
  amount:          z.number().positive().min(1),
  note:            z.string().max(200).optional(),
});
