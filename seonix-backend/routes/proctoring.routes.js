import express from "express";
import {
  createOrUpdateProctoringLog,
  logViolation,
  getProctoringLogBySession,
  getProctoringLogsByExam,
  getFlaggedLogs,
  updateReviewStatus,
} from "../controllers/proctoring.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/roleCheck.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { logViolationValidator } from "../utils/validators.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create or update proctoring log (student)
router.post("/log", authorize("student"), createOrUpdateProctoringLog);

// Log violation (student)
router.post(
  "/violation",
  authorize("student"),
  logViolationValidator,
  validate,
  logViolation
);

// Get proctoring log by session
router.get("/session/:sessionId", getProctoringLogBySession);

// Get all logs for an exam (teacher only)
router.get(
  "/exam/:examId",
  authorize("teacher", "admin"),
  getProctoringLogsByExam
);

// Get flagged logs (teacher only)
router.get("/flagged", authorize("teacher", "admin"), getFlaggedLogs);

// Update review status (teacher only)
router.put("/:logId/review", authorize("teacher", "admin"), updateReviewStatus);

export default router;
