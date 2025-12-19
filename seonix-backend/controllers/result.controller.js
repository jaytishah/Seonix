import asyncHandler from "express-async-handler";
import Result from "../models/Result.model.js";
import Question from "../models/Question.model.js";
import Exam from "../models/Exam.model.js";
import ExamSession from "../models/ExamSession.model.js";
import { HTTP_STATUS } from "../config/constants.js";
import { calculateTimeDifference } from "../utils/helpers.js";

// @desc    Submit exam and calculate result
// @route   POST /api/results/submit
// @access  Private (Student only)


export const submitExam = asyncHandler(async (req, res) => {
  const { examId, sessionId, answers } = req.body;

  // Verify session
  const session = await ExamSession.findOne({ sessionId });

  if (!session) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Session not found");
  }

  if (session.userId.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized");
  }

  if (session.status !== "active") {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Session is not active");
  }

  // Get exam
  const exam = await Exam.findOne({ examId });

  if (!exam) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Exam not found");
  }

  // Get all questions for this exam
  const questions = await Question.find({ examId });

  // Calculate marks
  let correctAnswers = 0;
  let obtainedMarks = 0;

  const answersMap = new Map(Object.entries(answers));

  questions.forEach((question) => {
    const questionId = question._id.toString();
    const userAnswer = answersMap.get(questionId);

    if (userAnswer) {
      // Find the correct answer
      const correctOption = question.options.find((opt) => opt.isCorrect);
      const userSelectedOption = question.options.find(
        (opt) => opt._id.toString() === userAnswer
      );

      if (
        userSelectedOption &&
        correctOption &&
        userSelectedOption._id.toString() === correctOption._id.toString()
      ) {
        correctAnswers += 1;
        obtainedMarks += question.marks;
      }
    }
  });

  // Calculate time taken
  const timeTaken = calculateTimeDifference(session.startTime, new Date());

  // Determine pass/fail status
  const percentage =
    exam.totalMarks > 0
      ? Math.round((obtainedMarks / exam.totalMarks) * 100)
      : 0;
  const status = percentage >= (exam.passingMarks || 0) ? "passed" : "failed";

  // Create result
  const result = await Result.create({
    examId,
    sessionId,
    userId: req.user._id,
    answers: answersMap,
    totalQuestions: questions.length,
    attemptedQuestions: answersMap.size,
    correctAnswers,
    wrongAnswers: answersMap.size - correctAnswers,
    totalMarks: exam.totalMarks,
    obtainedMarks,
    percentage,
    status,
    timeTaken,
    submittedAt: new Date(),
    showToStudent: exam.configuration.showResultImmediately || false,
  });

  // Update session status
  session.status = "completed";
  session.endTime = new Date();
  session.answers = answersMap;
  await session.save();

  // Update exam statistics
  exam.statistics.totalAttempts += 1;
  const allResults = await Result.find({ examId });
  const avgScore =
    allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length;
  exam.statistics.averageScore = Math.round(avgScore);
  await exam.save();

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Exam submitted successfully",
    data: result,
  });
});

// @desc    Get result by ID
// @route   GET /api/results/:resultId
// @access  Private
export const getResultById = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.resultId)
    .populate("userId", "name email")
    .populate({
      path: "examId",
      select: "title description totalMarks",
    });

  if (!result) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Result not found");
  }

  // Check authorization
  const isOwner = result.userId._id.toString() === req.user._id.toString();
  const isTeacher = req.user.role === "teacher";

  if (!isOwner && !isTeacher) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to access this result");
  }

  // Students can only see results if showToStudent is true
  if (isOwner && req.user.role === "student" && !result.showToStudent) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Results are not yet published");
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

// @desc    Get all results for a student
// @route   GET /api/results/student/me
// @access  Private (Student only)
export const getMyResults = asyncHandler(async (req, res) => {
  const results = await Result.find({
    userId: req.user._id,
    showToStudent: true,
  }).sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: results.length,
    data: results,
  });
});

// @desc    Get all results for an exam (Teacher only)
// @route   GET /api/results/exam/:examId
// @access  Private (Teacher only)
export const getResultsByExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  // Verify exam exists and user owns it
  const exam = await Exam.findOne({ examId });

  if (!exam) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Exam not found");
  }

  if (exam.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to view results for this exam");
  }

  const results = await Result.find({ examId })
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: results.length,
    data: results,
  });
});

// @desc    Publish/unpublish result (Teacher only)
// @route   PUT /api/results/:resultId/publish
// @access  Private (Teacher only)
// export const toggleResultVisibility = asyncHandler(async (req, res) => {
//   const { resultId } = req.params;
//   const { showToStudent } = req.body;

//   const result = await Result.findById(resultId);

//   if (!result) {
//     res.status(HTTP_STATUS.NOT_FOUND);
//     throw new Error("Result not found");
//   }

//   // Verify exam ownership
//   const exam = await Exam.findOne({ examId: result.examId });

//   if (!exam || exam.createdBy.toString() !== req.user._id.toString()) {
//     res.status(HTTP_STATUS.FORBIDDEN);
//     throw new Error("Not authorized to modify this result");
//   }

//   result.showToStudent =
//     showToStudent !== undefined ? showToStudent : !result.showToStudent;

//   if (result.showToStudent && !result.publishedAt) {
//     result.publishedAt = new Date();
//   }

//   await result.save();

//   res.status(HTTP_STATUS.OK).json({
//     success: true,
//     message: `Result ${
//       result.showToStudent ? "published" : "unpublished"
//     } successfully`,
//     data: result,
//   });
// });


// @desc    Publish/unpublish result (Teacher only)
// @route   PUT /api/results/:resultId/publish
// @access  Private (Teacher only)
export const toggleResultVisibility = asyncHandler(async (req, res) => {
  const { resultId } = req.params;
  const { showToStudent } = req.body;

  console.log("Toggle visibility request:", { resultId, showToStudent, body: req.body });

  // Validate showToStudent is provided
  if (showToStudent === undefined || showToStudent === null) {
    res.status(HTTP_STATUS.BAD_REQUEST);
    throw new Error("showToStudent field is required");
  }

  const result = await Result.findById(resultId);

  if (!result) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Result not found");
  }

  // Verify exam ownership
  const exam = await Exam.findOne({ examId: result.examId });

  if (!exam) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Exam not found");
  }

  if (exam.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to modify this result");
  }

  // Update visibility
  result.showToStudent = showToStudent;

  if (result.showToStudent && !result.publishedAt) {
    result.publishedAt = new Date();
  }

  await result.save();

  console.log("Result visibility updated:", { 
    resultId: result._id, 
    showToStudent: result.showToStudent 
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Result ${
      result.showToStudent ? "published" : "unpublished"
    } successfully`,
    data: result,
  });
});
// @desc    Add feedback to result (Teacher only)
// @route   PUT /api/results/:resultId/feedback
// @access  Private (Teacher only)
export const addResultFeedback = asyncHandler(async (req, res) => {
  const { resultId } = req.params;
  const { feedback } = req.body;

  const result = await Result.findById(resultId);

  if (!result) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Result not found");
  }

  // Verify exam ownership
  const exam = await Exam.findOne({ examId: result.examId });

  if (!exam || exam.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to add feedback to this result");
  }

  result.feedback = feedback;
  result.gradedBy = req.user._id;
  result.gradedAt = new Date();

  await result.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Feedback added successfully",
    data: result,
  });
});
