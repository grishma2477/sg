
import { ApiResponse } from "../utils/ApiResponse.js";

export const createProvider = async (req, res, next) => {
  try {
    const provider = await PaymentProviderService.createProvider(req.body);

    res.status(201).json(
      ApiResponse.success(provider, "PROVIDER_CREATED")
    );
  } catch (err) {
    next(err);
  }
};

export const updateProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await PaymentProviderService.updateProvider(id, req.body);

    res.json(ApiResponse.success(result));
  } catch (err) {
    next(err);
  }
};

export const deactivateProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await PaymentProviderService.deactivateProvider(id);

    res.json(ApiResponse.success(result));
  } catch (err) {
    next(err);
  }
};

export const getProviders = async (req, res, next) => {
  try {
    const providers = await PaymentProviderService.getAllProviders();

    res.json(ApiResponse.success(providers));
  } catch (err) {
    next(err);
  }
};