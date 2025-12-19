import asyncHandler from "express-async-handler";
import Question from "../models/Question.model.js";
import Exam from "../models/Exam.model.js";
import { HTTP_STATUS } from "../config/constants.js";
import { shuffleArray } from "../utils/helpers.js";

// @desc    Add question to exam
// @route   POST /api/questions
// @access  Private (Teacher only)
export const createQuestion = asyncHandler(async (req, res) => {
  const {
    examId,
    questionText,
    options,
    marks,
    difficulty,
    category,
    explanation,
  } = req.body;

  // Verify exam exists and user owns it
  const exam = await Exam.findOne({ examId });

  if (!exam) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Exam not found");
  }

  if (exam.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to add questions to this exam");
  }

  // Validate at least one correct answer
  const hasCorrectAnswer = options.some((opt) => opt.isCorrect);
  if (!hasCorrectAnswer) {
    res.status(HTTP_STATUS.BAD_REQUEST);
    throw new Error("At least one option must be marked as correct");
  }

  const question = await Question.create({
    examId,
    questionText,
    options,
    marks: marks || 1,
    difficulty: difficulty || "medium",
    category: category || "General",
    explanation,
    createdBy: req.user._id,
  });

  // Update exam totals
  exam.totalQuestions += 1;
  exam.totalMarks += question.marks;
  await exam.save();

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Question added successfully",
    data: question,
  });
});

// @desc    Get all questions for an exam
// @route   GET /api/questions/exam/:examId
// @access  Private
export const getQuestionsByExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { shuffle } = req.query;

  // Verify exam exists
  const exam = await Exam.findOne({ examId });

  if (!exam) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Exam not found");
  }

  // Check authorization
  const isTeacher =
    req.user.role === "teacher" &&
    exam.createdBy.toString() === req.user._id.toString();
  const isStudent = req.user.role === "student";

  if (!isTeacher && !isStudent) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to access these questions");
  }

  let questions = await Question.find({ examId }).select("-__v");

  // For students, shuffle questions if enabled and hide correct answers
  if (isStudent) {
    questions = questions.map((q) => {
      const questionObj = q.toObject();

      // Shuffle options if configured
      if (exam.configuration.shuffleOptions) {
        questionObj.options = shuffleArray(questionObj.options);
      }

      // Remove correct answer information
      questionObj.options = questionObj.options.map((opt) => ({
        text: opt.text,
        _id: opt._id,
      }));

      // Remove explanation
      delete questionObj.explanation;

      return questionObj;
    });

    // Shuffle questions if configured
    if (shuffle === "true" && exam.configuration.shuffleQuestions) {
      questions = shuffleArray(questions);
    }
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: questions.length,
    data: questions,
  });
});

// @desc    Get single question by ID
// @route   GET /api/questions/:id
// @access  Private (Teacher only)
export const getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Question not found");
  }

  // Verify ownership
  if (question.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to access this question");
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: question,
  });
});

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private (Teacher only)
export const updateQuestion = asyncHandler(async (req, res) => {
  let question = await Question.findById(req.params.id);

  if (!question) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Question not found");
  }

  // Verify ownership
  if (question.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to update this question");
  }

  const oldMarks = question.marks;

  // Update fields
  const allowedUpdates = [
    "questionText",
    "options",
    "marks",
    "difficulty",
    "category",
    "explanation",
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      question[field] = req.body[field];
    }
  });

  // Validate at least one correct answer
  if (req.body.options) {
    const hasCorrectAnswer = question.options.some((opt) => opt.isCorrect);
    if (!hasCorrectAnswer) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      throw new Error("At least one option must be marked as correct");
    }
  }

  const updatedQuestion = await question.save();

  // Update exam total marks if marks changed
  if (req.body.marks && req.body.marks !== oldMarks) {
    const exam = await Exam.findOne({ examId: question.examId });
    if (exam) {
      exam.totalMarks = exam.totalMarks - oldMarks + updatedQuestion.marks;
      await exam.save();
    }
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Question updated successfully",
    data: updatedQuestion,
  });
});

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private (Teacher only)
export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Question not found");
  }

  // Verify ownership
  if (question.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to delete this question");
  }

  // Update exam totals
  const exam = await Exam.findOne({ examId: question.examId });
  if (exam) {
    exam.totalQuestions -= 1;
    exam.totalMarks -= question.marks;
    await exam.save();
  }

  await question.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Question deleted successfully",
  });
});

// @desc    Bulk add questions
// @route   POST /api/questions/bulk
// @access  Private (Teacher only)
export const bulkCreateQuestions = asyncHandler(async (req, res) => {
  const { examId, questions } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    res.status(HTTP_STATUS.BAD_REQUEST);
    throw new Error("Please provide an array of questions");
  }

  // Verify exam exists and user owns it
  const exam = await Exam.findOne({ examId });

  if (!exam) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Exam not found");
  }

  if (exam.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to add questions to this exam");
  }

  // Add examId and createdBy to each question
  const questionsToCreate = questions.map((q) => ({
    ...q,
    examId,
    createdBy: req.user._id,
  }));

  const createdQuestions = await Question.insertMany(questionsToCreate);

  // Update exam totals
  const totalMarks = createdQuestions.reduce((sum, q) => sum + q.marks, 0);
  exam.totalQuestions += createdQuestions.length;
  exam.totalMarks += totalMarks;
  await exam.save();

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: `${createdQuestions.length} questions added successfully`,
    data: createdQuestions,
  });
});
