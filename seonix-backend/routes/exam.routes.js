import express from "express";
import {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  getExamStatistics,
} from "../controllers/exam.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/roleCheck.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { createExamValidator, examIdValidator } from "../utils/validators.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// General routes
router
  .route("/")
  .get(getAllExams)
  .post(
    authorize("teacher", "admin"),
    createExamValidator,
    validate,
    createExam
  );

router
  .route("/:examId")
  .get(examIdValidator, validate, getExamById)
  .put(authorize("teacher", "admin"), examIdValidator, validate, updateExam)
  .delete(authorize("teacher", "admin"), examIdValidator, validate, deleteExam);

// Statistics route (teacher only)
router.get(
  "/:examId/statistics",
  authorize("teacher", "admin"),
  examIdValidator,
  validate,
  getExamStatistics
);

export default router;
