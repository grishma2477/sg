// import { ApiResponse } from "../utils/ApiResponse.js";

// export const requireRole = (roles = []) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return ApiResponse.error(403, "Forbidden");
//     }
//     next();
//   };
// };


import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Role-based Access Control Middleware
 * 
 * @param {string[]} roles - Array of allowed roles (e.g., ["admin", "driver"])
 */
export const requireRole = (roles = []) => {
  return (req, res, next) => {
    // Check if user exists (should be set by verifyuser middleware)
    if (!req.user) {
      return res.status(401).json(
        ApiResponse.error("UNAUTHORIZED", 401)
      );
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        ApiResponse.error("FORBIDDEN", 403, {
          required: roles,
          current: req.user.role
        })
      );
    }

    next();
  };
};