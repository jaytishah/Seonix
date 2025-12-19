import { HTTP_STATUS } from "../config/constants.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log(
      "🔐 Authorize middleware - User role:",
      req.user?.role,
      "Required roles:",
      roles
    );

    if (!req.user) {
      console.log("❌ No user found in request");
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Not authorized - No user",
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log(
        "❌ User role not authorized:",
        req.user.role,
        "Required:",
        roles
      );
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: `User role '${
          req.user.role
        }' is not authorized to access this route. Required: ${roles.join(
          " or "
        )}`,
      });
    }

    console.log("✅ Authorization successful");
    next();
  };
};
