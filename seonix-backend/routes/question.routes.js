import express from 'express';
import {
  createQuestion,
  getQuestionsByExam,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
} from '../controllers/question.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/roleCheck.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createQuestionValidator, objectIdValidator, examIdValidator } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Bulk create questions (teacher only)
router.post('/bulk', authorize('teacher', 'admin'), bulkCreateQuestions);

// Create question (teacher only)
router.post('/', authorize('teacher', 'admin'), createQuestionValidator, validate, createQuestion);

// Get questions by exam ID
router.get('/exam/:examId', examIdValidator, validate, getQuestionsByExam);

// Question CRUD by ID
router
  .route('/:id')
  .get(authorize('teacher', 'admin'), objectIdValidator, validate, getQuestionById)
  .put(authorize('teacher', 'admin'), objectIdValidator, validate, updateQuestion)
  .delete(authorize('teacher', 'admin'), objectIdValidator, validate, deleteQuestion);

export default router;
