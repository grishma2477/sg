import express from "express";
import { verifyuser } from "../middleware/auth.js";
import { autocomplete, placeDetails, reverseGeocodeHandler } from "../controllers/mapsController.js";

const router = express.Router();

// All maps endpoints require auth (hides API key from unauthenticated callers)
router.use(verifyuser);

// GET /api/maps/autocomplete?query=Thamel&lat=27.71&lng=85.32
router.get("/autocomplete", autocomplete);

// GET /api/maps/place/:placeId
router.get("/place/:placeId", placeDetails);

// GET /api/maps/reverse?lat=27.71&lng=85.32
router.get("/reverse", reverseGeocodeHandler);

export default router;
