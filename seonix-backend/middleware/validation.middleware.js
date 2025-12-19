import { validationResult } from "express-validator";
import { HTTP_STATUS } from "../config/constants.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Validation error",
      errors: errorMessages,
    });
  }

  next();
};
    