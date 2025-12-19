import express from "express";
import {
  submitExam,
  getResultById,
  getMyResults,
  getResultsByExam,
  toggleResultVisibility,
  addResultFeedback,
} from "../controllers/result.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/roleCheck.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { resultIdValidator } from "../utils/validators.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Submit exam (student only)
router.post("/submit", authorize("student"), submitExam);

// Get my results (student only)
router.get("/student/me", authorize("student"), getMyResults);

// Get results by exam (teacher only)
router.get("/exam/:examId", authorize("teacher", "admin"), getResultsByExam);

// Result operations
router.get("/:resultId", resultIdValidator, validate, getResultById);
router.put(
  "/:resultId/publish",
  authorize("teacher", "admin"),
  resultIdValidator,
  validate,
  toggleResultVisibility
);
router.put(
  "/:resultId/feedback",
  authorize("teacher", "admin"),
  resultIdValidator,
  validate,
  addResultFeedback
);

export default router;
