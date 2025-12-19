import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { registerValidator, loginValidator } from "../utils/validators.js";

const router = express.Router();

// Public routes
router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;
