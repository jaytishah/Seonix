import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";
import { HTTP_STATUS } from "../config/constants.js";

// export const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   // Check for token in cookies or Authorization header
//   if (req.cookies.token) {
//     token = req.cookies.token;
//   } else if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     res.status(HTTP_STATUS.UNAUTHORIZED);
//     throw new Error("Not authorized, no token provided");
//   }

//   try {
//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Get user from token
//     req.user = await User.findById(decoded.id).select("-password");

//     if (!req.user) {
//       res.status(HTTP_STATUS.UNAUTHORIZED);
//       throw new Error("User not found");
//     }

//     if (!req.user.isActive) {
//       res.status(HTTP_STATUS.FORBIDDEN);
//       throw new Error("Account has been deactivated");
//     }

//     next();
//   } catch (error) {
//     res.status(HTTP_STATUS.UNAUTHORIZED);
//     throw new Error("Not authorized, token failed");
//   }
// });


export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies or Authorization header
  if (req.cookies.token) {
    token = req.cookies.token;
    console.log("🍪 Token from cookie");
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("🔑 Token from Authorization header");
  }

  if (!token) {
    console.log("❌ No token provided");
    res.status(HTTP_STATUS.UNAUTHORIZED);
    throw new Error("Not authorized, no token provided");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.log("❌ User not found for token");
      res.status(HTTP_STATUS.UNAUTHORIZED);
      throw new Error("User not found");
    }

    if (!req.user.isActive) {
      console.log("❌ User account deactivated");
      res.status(HTTP_STATUS.FORBIDDEN);
      throw new Error("Account has been deactivated");
    }

    console.log(
      "✅ User authenticated:",
      req.user.email,
      "Role:",
      req.user.role
    );
    next();
  } catch (error) {
    console.log("❌ Token verification failed:", error.message);
    res.status(HTTP_STATUS.UNAUTHORIZED);
    throw new Error("Not authorized, token failed");
  }
});
