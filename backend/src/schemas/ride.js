import { z } from "zod";

const coordPair = z.object({
  coordinates: z.tuple([
    z.number().min(-180).max(180),  // lng
    z.number().min(-90).max(90),    // lat
  ]),
});

const stopSchema = z.object({
  location:       coordPair,
  address:        z.string().max(500),
  maxWaitSeconds: z.number().int().min(0).max(600).default(120),
});

export const estimateFareSchema = z.object({
  pickup_lat:  z.coerce.number().min(-90).max(90),
  pickup_lng:  z.coerce.number().min(-180).max(180),
  dropoff_lat: z.coerce.number().min(-90).max(90),
  dropoff_lng: z.coerce.number().min(-180).max(180),
  stops:       z.string().optional(),  // JSON string, parsed in controller
});

export const createRideRequestSchema = z.object({
  pickupLocation:    coordPair,
  pickupAddress:     z.string().min(2).max(500),
  dropoffLocation:   coordPair,
  dropoffAddress:    z.string().min(2).max(500),
  vehiclePreference: z.enum(["bike", "car", "suv"]),
  pricingMode:       z.enum(["fixed", "bidding"]).default("bidding"),
  passengerCount:    z.number().int().min(1).max(6).default(1),
  notes:             z.string().max(300).optional(),
  stops:             z.array(stopSchema).max(3).optional(),
});
