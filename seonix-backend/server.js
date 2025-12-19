import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/database.js";
import {
  notFound,
  errorHandler,
} from "./middleware/errorHandler.middleware.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import examRoutes from "./routes/exam.routes.js";
import questionRoutes from "./routes/question.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import proctoringRoutes from "./routes/proctoring.routes.js";
import resultRoutes from "./routes/result.routes.js";
import { markExpiredExamsInactive } from "./utils/examCleanup.js";


// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// Rate limiting
// const limiter = rateLimit({
//   windowMs:
//     parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
//   message: "Too many requests from this IP, please try again later",
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use("/api/", limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser middleware
app.use(cookieParser());

// Logging middleware (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/proctoring", proctoringRoutes);
app.use("/api/results", resultRoutes);


// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log("\n🚀 Server is running!");
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(
    `💻 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );

  // ✅ Mark expired exams as inactive on server startup
  console.log("\n🔄 Running exam cleanup...");
  await markExpiredExamsInactive();

  // ✅ Schedule cleanup to run every hour
  console.log("⏰ Scheduling hourly exam cleanup...\n");
  setInterval(async () => {
    console.log("\n🔄 Running scheduled exam cleanup...");
    await markExpiredExamsInactive();
  }, 60 * 60 * 1000); // Run every hour
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
});

export default app;
