import { HTTP_STATUS } from "../config/constants.js";

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(HTTP_STATUS.NOT_FOUND);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode =
    res.statusCode === 200 ? HTTP_STATUS.INTERNAL_SERVER_ERROR : res.statusCode;
  let message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = HTTP_STATUS.NOT_FOUND;
    message = "Resource not found";
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyValue)[0];
    message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } already exists`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(", ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = "Token expired";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
