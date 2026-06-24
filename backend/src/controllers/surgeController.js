import { SurgeService } from '../application/services/SurgeService.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const listSurges = async (req, res, next) => {
  try {
    const surges = await SurgeService.listActive();
    res.json(ApiResponse.success(surges));
  } catch (err) { next(err); }
};

export const createSurge = async (req, res, next) => {
  try {
    const { area_name, lat, lng, radius_km, multiplier, reason, ends_at } = req.body;

    if (!area_name || !lat || !lng || !multiplier || !ends_at) {
      return res.status(400).json(ApiResponse.error('area_name, lat, lng, multiplier, ends_at are required', 400));
    }
    if (multiplier < 1.0 || multiplier > 5.0) {
      return res.status(400).json(ApiResponse.error('multiplier must be between 1.0 and 5.0', 400));
    }

    const surge = await SurgeService.create({
      area_name, lat, lng, radius_km: radius_km ?? 2,
      multiplier, reason, ends_at, created_by: req.user.id,
    });
    res.status(201).json(ApiResponse.success(surge, 'SURGE_CREATED'));
  } catch (err) { next(err); }
};

export const deleteSurge = async (req, res, next) => {
  try {
    const surge = await SurgeService.endEarly(req.params.id);
    if (!surge) return res.status(404).json(ApiResponse.error('Surge not found or already ended', 404));
    res.json(ApiResponse.success(surge, 'SURGE_ENDED'));
  } catch (err) { next(err); }
};

export const checkSurge = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json(ApiResponse.error('lat and lng required', 400));
    const result = await SurgeService.getMultiplier(parseFloat(lat), parseFloat(lng));
    res.json(ApiResponse.success(result));
  } catch (err) { next(err); }
};
