import { z } from "zod";

export const addPaymentMethodSchema = z.object({
  type:          z.enum(["esewa", "khalti", "bank_account", "card"]),
  account_name:  z.string().min(2).max(100).optional(),
  account_number: z.string().max(50).optional(),
  phone_number:  z.string().regex(/^\+977[0-9]{10}$/).optional(),
  is_default:    z.boolean().default(false),
});
