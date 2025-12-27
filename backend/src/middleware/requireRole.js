import { failure } from "../utils/ApiResponse";

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return failure(403, "Forbidden");
    }
    next();
  };
};
