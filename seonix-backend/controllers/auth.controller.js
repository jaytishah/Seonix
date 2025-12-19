import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";
import generateToken, { setTokenCookie } from "../utils/generateToken.js";
import { HTTP_STATUS } from "../config/constants.js";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(HTTP_STATUS.CONFLICT);
    
    throw new Error("User already exists with this email");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || "student",
  });

  if (user) {
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: user.getPublicProfile(),
        token,
      },
    });
  } else {
    res.status(HTTP_STATUS.BAD_REQUEST);
    throw new Error("Invalid user data");
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(HTTP_STATUS.UNAUTHORIZED);
    throw new Error("Invalid email or password");
  }

  // Check if account is active
  if (!user.isActive) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error(
      "Your account has been deactivated. Please contact support."
    );
  }

  // Verify password
  const isPasswordValid = await user.matchPassword(password);

  if (!isPasswordValid) {
    res.status(HTTP_STATUS.UNAUTHORIZED);
    throw new Error("Invalid email or password");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Login successful",
    data: {
      user: user.getPublicProfile(),
      token,
    },
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Logged out successfully",
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("User not found");
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: user.getPublicProfile(),
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("User not found");
  }

  // Update allowed fields
  user.name = req.body.name || user.name;
  user.profileImage = req.body.profileImage || user.profileImage;

  // Update email if changed and not taken
  if (req.body.email && req.body.email !== user.email) {
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
      res.status(HTTP_STATUS.CONFLICT);
      throw new Error("Email already in use");
    }
    user.email = req.body.email;
  }

  const updatedUser = await user.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser.getPublicProfile(),
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(HTTP_STATUS.BAD_REQUEST);
    throw new Error("Please provide current and new password");
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("User not found");
  }

  // Verify current password
  const isPasswordValid = await user.matchPassword(currentPassword);

  if (!isPasswordValid) {
    res.status(HTTP_STATUS.UNAUTHORIZED);
    throw new Error("Current password is incorrect");
  }

  // Set new password
  user.password = newPassword;
  await user.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Password changed successfully",
  });
});
