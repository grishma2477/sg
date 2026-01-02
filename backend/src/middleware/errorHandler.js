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

export const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : "INTERNAL_SERVER_ERROR";

  res.status(statusCode).json(
    ApiResponse.error(message, statusCode, err.data)
  );
};
