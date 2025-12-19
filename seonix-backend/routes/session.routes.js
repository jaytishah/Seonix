import express from "express";
import {
  startExamSession,
  updateSessionActivity,
  endExamSession,
  getSessionById,
  getSessionsByExam,
} from "../controllers/session.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/roleCheck.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Start session (student only)
router.post("/start", authorize("student"), startExamSession);

// Session operations
router.put("/:sessionId/activity", authorize("student"), updateSessionActivity);
router.put("/:sessionId/end", authorize("student"), endExamSession);
router.get("/:sessionId", getSessionById);

// Get all sessions for an exam (teacher only)
router.get("/exam/:examId", authorize("teacher", "admin"), getSessionsByExam);

export default router;
