import { z } from "zod";

export const submitBidSchema = z.object({
  ride_request_id: z.string().uuid("Invalid ride request ID"),
  amount:          z.number().positive().min(50, "Minimum bid is NPR 50").max(10000),
  eta_minutes:     z.number().int().min(1).max(120).optional(),
  message:         z.string().max(200).optional(),
});

export const counterBidSchema = z.object({
  amount:  z.number().positive().min(50).max(10000),
  message: z.string().max(200).optional(),
});
