import {
  getPlaceAutocomplete,
  getPlaceDetails,
  reverseGeocode,
} from "../infrastructure/mapsClient.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const autocomplete = async (req, res, next) => {
  try {
    const { query, lat, lng } = req.query;
    if (!query) {
      return res.status(400).json(ApiResponse.error("query param required", 400));
    }
    const results = await getPlaceAutocomplete(
      query,
      parseFloat(lat) || 27.7172,
      parseFloat(lng) || 85.324
    );
    res.json(ApiResponse.success(results));
  } catch (err) {
    next(err);
  }
};

export const placeDetails = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const result = await getPlaceDetails(placeId);
    res.json(ApiResponse.success(result));
  } catch (err) {
    next(err);
  }
};

export const reverseGeocodeHandler = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json(ApiResponse.error("lat and lng required", 400));
    }
    const result = await reverseGeocode(parseFloat(lat), parseFloat(lng));
    res.json(ApiResponse.success(result));
  } catch (err) {
    next(err);
  }
};
