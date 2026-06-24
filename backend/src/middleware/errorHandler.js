// import { ApiResponse } from "../utils/ApiResponse.js";

// export const errorHandler = (err, req, res, next) => {
//   console.error(err.message);

//   const statusCode = err.statusCode || 500;
//   const message =
//     err.isOperational
//       ? err.message
//       : "INTERNAL_SERVER_ERROR";

//   res.status(statusCode).json(
//     ApiResponse.error(message, statusCode)
//   );
// };



import { ApiResponse } from "../utils/ApiResponse.js";
import logger from "../infrastructure/logger.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.isOperational ? err.message : "INTERNAL_SERVER_ERROR";

  logger.error('unhandled error', {
    message:    err.message,
    stack:      err.stack,
    statusCode,
    requestId:  req.requestId,
    userId:     req.user?.userId,
    path:       req.path,
    method:     req.method,
  });

  res.status(statusCode).json(
    ApiResponse.error(message, statusCode, err.data)
  );
};
