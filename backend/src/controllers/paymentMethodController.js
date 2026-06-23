
// import { PaymentProviderService } from "../application/services/PaymentProviderService.js";
// import { PaymentService } from "../application/services/PaymentService.js";
// import { ApiResponse } from "../utils/ApiResponse.js";

// export const createProvider = async (req, res, next) => {
//   try {
//     const provider = await PaymentService.createProvider(req.body);

//     res.status(201).json(
//       ApiResponse.success(provider, "PROVIDER_CREATED")
//     );
//   } catch (err) {
//     next(err);
//   }
// };

// export const updateProvider = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const result = await PaymentProviderService.updateProvider(id, req.body);

//     res.json(ApiResponse.success(result));
//   } catch (err) {
//     next(err);
//   }
// };

// export const deactivateProvider = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const result = await PaymentProviderService.deactivateProvider(id);

//     res.json(ApiResponse.success(result));
//   } catch (err) {
//     next(err);
//   }
// };

// export const getProviders = async (req, res, next) => {
//   try {
//     const providers = await PaymentProviderService.getAllProviders();

//     res.json(ApiResponse.success(providers));
//   } catch (err) {
//     next(err);
//   }
// };



import { PaymentProviderService } from "../application/services/PaymentProviderService.js";
import { PaymentService } from "../application/services/PaymentService.js";
import { PaymentMethodService } from "../application/services/PaymentMethodService.js";
import { ApiResponse } from "../utils/ApiResponse.js";



/* =========================
   ADMIN - PAYMENT PROVIDERS
========================= */

export const createProvider = async (req, res, next) => {
  try {

    const provider = await PaymentService.createProvider(req.body);

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



/* =========================
   USER - PAYMENT METHODS
========================= */

export const addPaymentMethod = async (req, res, next) => {
  try {

    const method = await PaymentMethodService.addPaymentMethod({
      userId: req.user.id,
      providerId: req.body.providerId,
      providerToken: req.body.providerToken,
      accountIdentifier: req.body.accountIdentifier
    });

    res.status(201).json(
      ApiResponse.success(method, "PAYMENT_METHOD_ADDED")
    );

  } catch (err) {
    next(err);
  }
};


export const setDefaultPaymentMethod = async (req, res, next) => {
  try {

    const { methodId } = req.params;

    const result = await PaymentMethodService.setDefault(
      methodId,
      req.user.id
    );

    res.json(ApiResponse.success(result));

  } catch (err) {
    next(err);
  }
};


export const getUserPaymentMethods = async (req, res, next) => {
  try {

    const methods = await PaymentMethodService.getUserPaymentMethods(
      req.user.id
    );

    res.json(ApiResponse.success(methods));

  } catch (err) {
    next(err);
  }
};


export const deletePaymentMethod = async (req, res, next) => {
  try {

    const { methodId } = req.params;

    const result = await PaymentMethodService.deletePaymentMethod(
      methodId,
      req.user.id
    );

    res.json(ApiResponse.success(result));

  } catch (err) {
    next(err);
  }
};