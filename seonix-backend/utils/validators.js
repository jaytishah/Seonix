import { body, param, query } from "express-validator";

// Auth Validators
export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["student", "teacher", "admin"])
    .withMessage("Invalid role"),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// Exam Validators
export const createExamValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("duration")
    .notEmpty()
    .withMessage("Duration is required")
    .isInt({ min: 5, max: 300 })
    .withMessage("Duration must be between 5 and 300 minutes"),
  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Invalid start date format"),
  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("Invalid end date format")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
];

// Question Validators
export const createQuestionValidator = [
  body("examId").notEmpty().withMessage("Exam ID is required"),
  body("questionText")
    .trim()
    .notEmpty()
    .withMessage("Question text is required")
    .isLength({ min: 5 })
    .withMessage("Question must be at least 5 characters"),
  body("options")
    .isArray({ min: 2, max: 6 })
    .withMessage("Must provide between 2 and 6 options"),
  body("options.*.text")
    .trim()
    .notEmpty()
    .withMessage("Option text is required"),
  body("marks")
    .notEmpty()
    .withMessage("Marks are required")
    .isInt({ min: 1 })
    .withMessage("Marks must be at least 1"),
];

// Proctoring Validators
export const logViolationValidator = [
  body("examId").notEmpty().withMessage("Exam ID is required"),
  body("sessionId").notEmpty().withMessage("Session ID is required"),
  body("type")
    .notEmpty()
    .withMessage("Violation type is required")
    .isIn([
      "no_face",
      "multiple_faces",
      "cell_phone",
      "prohibited_object",
      "tab_switch",
      "fullscreen_exit",
      "copy_paste",
      "suspicious_activity",
    ])
    .withMessage("Invalid violation type"),
  body("severity")
    .optional()
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid severity level"),
];

// Param Validators
export const objectIdValidator = [
  param("id").isMongoId().withMessage("Invalid ID format"),
];

export const examIdValidator = [
  param("examId").notEmpty().withMessage("Exam ID is required"),
];

export const resultIdValidator = [
  param("resultId").isMongoId().withMessage("Invalid result ID format"),
];
