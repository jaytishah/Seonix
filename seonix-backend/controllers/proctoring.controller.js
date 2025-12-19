import asyncHandler from "express-async-handler";
import ProctoringLog from "../models/ProctoringLog.model.js";
import ExamSession from "../models/ExamSession.model.js";
import Exam from "../models/Exam.model.js";
import { HTTP_STATUS, VIOLATION_TYPES } from "../config/constants.js";

// @desc    Create or update proctoring log
// @route   POST /api/proctoring/log
// @access  Private (Student only)
export const createOrUpdateProctoringLog = asyncHandler(async (req, res) => {
  const { examId, sessionId } = req.body;

  // Verify session exists and belongs to user
  const session = await ExamSession.findOne({ sessionId });

  if (!session) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Session not found");
  }

  if (session.userId.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized");
  }

  // Find existing log or create new one
  let log = await ProctoringLog.findOne({
    examId,
    sessionId,
    userId: req.user._id,
  });

  if (!log) {
    log = await ProctoringLog.create({
      examId,
      sessionId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      violations: [],
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: log,
  });
});

// @desc    Log violation
// @route   POST /api/proctoring/violation
// @access  Private (Student only)
export const logViolation = asyncHandler(async (req, res) => {
  const { examId, sessionId, type, severity, screenshot, description } =
    req.body;

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

  // Find or create proctoring log
  let log = await ProctoringLog.findOne({
    examId,
    sessionId,
    userId: req.user._id,
  });

  if (!log) {
    log = await ProctoringLog.create({
      examId,
      sessionId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      violations: [],
    });
  }

  // Add violation
  const violation = {
    type,
    severity: severity || "medium",
    timestamp: new Date(),
    screenshot: screenshot || "",
    description: description || "",
  };

  log.violations.push(violation);

  // Update violation summary
  switch (type) {
    case VIOLATION_TYPES.NO_FACE:
      log.violationSummary.noFaceCount += 1;
      break;
    case VIOLATION_TYPES.MULTIPLE_FACES:
      log.violationSummary.multipleFaceCount += 1;
      break;
    case VIOLATION_TYPES.CELL_PHONE:
      log.violationSummary.cellPhoneCount += 1;
      break;
    case VIOLATION_TYPES.PROHIBITED_OBJECT:
      log.violationSummary.prohibitedObjectCount += 1;
      break;
    case VIOLATION_TYPES.TAB_SWITCH:
      log.violationSummary.tabSwitchCount += 1;
      break;
    case VIOLATION_TYPES.FULLSCREEN_EXIT:
      log.violationSummary.fullscreenExitCount += 1;
      break;
    case VIOLATION_TYPES.COPY_PASTE:
      log.violationSummary.copyPasteCount += 1;
      break;
    case VIOLATION_TYPES.SUSPICIOUS_ACTIVITY:
      log.violationSummary.suspiciousActivityCount += 1;
      break;
  }

  // Calculate risk score
  log.calculateRiskScore();

  await log.save();

  // Update exam statistics
  const exam = await Exam.findOne({ examId });
  if (exam) {
    exam.statistics.totalViolations += 1;
    await exam.save();
  }

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Violation logged successfully",
    data: {
      violation,
      riskScore: log.riskScore,
      totalViolations: log.violations.length,
    },
  });
});

// @desc    Get proctoring log by session
// @route   GET /api/proctoring/session/:sessionId
// @access  Private
export const getProctoringLogBySession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const log = await ProctoringLog.findOne({ sessionId }).populate(
    "userId",
    "name email"
  );

  if (!log) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Proctoring log not found");
  }

  // Check authorization
  const isOwner = log.userId._id.toString() === req.user._id.toString();
  const isTeacher = req.user.role === "teacher";

  if (!isOwner && !isTeacher) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to access this log");
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: log,
  });
});

// @desc    Get all proctoring logs for an exam (Teacher only)
// @route   GET /api/proctoring/exam/:examId
// @access  Private (Teacher only)
export const getProctoringLogsByExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  // Verify exam exists and user owns it
  const exam = await Exam.findOne({ examId });

  if (!exam) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Exam not found");
  }

  if (exam.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to view proctoring logs for this exam");
  }

  const logs = await ProctoringLog.find({ examId })
    .populate("userId", "name email")
    .sort({ riskScore: -1, createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

// @desc    Get flagged logs (Teacher only)
// @route   GET /api/proctoring/flagged
// @access  Private (Teacher only)
export const getFlaggedLogs = asyncHandler(async (req, res) => {
  // Get all exams created by this teacher
  const teacherExams = await Exam.find({ createdBy: req.user._id }).select(
    "examId"
  );
  const examIds = teacherExams.map((exam) => exam.examId);

  const flaggedLogs = await ProctoringLog.find({
    examId: { $in: examIds },
    flaggedForReview: true,
  })
    .populate("userId", "name email")
    .sort({ riskScore: -1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: flaggedLogs.length,
    data: flaggedLogs,
  });
});

// @desc    Update review status
// @route   PUT /api/proctoring/:logId/review
// @access  Private (Teacher only)
export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { logId } = req.params;
  const { reviewNotes, flaggedForReview } = req.body;

  const log = await ProctoringLog.findById(logId);

  if (!log) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Proctoring log not found");
  }

  // Verify teacher owns the exam
  const exam = await Exam.findOne({ examId: log.examId });

  if (!exam || exam.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to review this log");
  }

  log.reviewNotes = reviewNotes || log.reviewNotes;
  log.flaggedForReview =
    flaggedForReview !== undefined ? flaggedForReview : log.flaggedForReview;
  log.reviewedBy = req.user._id;

  await log.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Review updated successfully",
    data: log,
  });
});
