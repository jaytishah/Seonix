import asyncHandler from "express-async-handler";
import ExamSession from "../models/ExamSession.model.js";
import Exam from "../models/Exam.model.js";
import Result from "../models/Result.model.js";
import { HTTP_STATUS } from "../config/constants.js";
import { v4 as uuidv4 } from "uuid";
import { parseUserAgent } from "../utils/helpers.js";

// @desc    Start exam session
// @route   POST /api/sessions/start
// @access  Private (Student only)
export const startExamSession = asyncHandler(async (req, res) => {
  const { examId } = req.body;

  // Verify exam exists and is active
  const exam = await Exam.findOne({ examId });

  if (!exam) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Exam not found");
  }

  if (!exam.isActive) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("This exam is not active");
  }

  // Check if exam is within date range
  const now = new Date();
  if (now < exam.startDate) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("This exam has not started yet");
  }

  if (now > exam.endDate) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("This exam has ended");
  }

  // Check if student already has an active session for this exam
  const existingSession = await ExamSession.findOne({
    examId,
    userId: req.user._id,
    status: "active",
  });

  if (existingSession) {
    // Return existing session
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Resuming existing session",
      data: existingSession,
    });
  }

  // Check if student already completed this exam
  const existingResult = await Result.findOne({
    examId,
    userId: req.user._id,
  });

  if (existingResult) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("You have already completed this exam");
  }

  // Parse user agent
  const userAgent = req.headers["user-agent"];
  const browserInfo = parseUserAgent(userAgent);

  // Create new session
  const session = await ExamSession.create({
    examId,
    userId: req.user._id,
    sessionId: uuidv4(),
    startTime: new Date(),
    browserInfo: {
      userAgent,
      ...browserInfo,
    },
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Exam session started successfully",
    data: session,
  });
});

// @desc    Update session activity
// @route   PUT /api/sessions/:sessionId/activity
// @access  Private (Student only)
export const updateSessionActivity = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { isFullscreenActive, tabSwitchCount, answers } = req.body;

  const session = await ExamSession.findOne({ sessionId });

  if (!session) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Session not found");
  }

  // Verify ownership
  if (session.userId.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to update this session");
  }

  // Check if session is still active
  if (session.status !== "active") {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("This session is no longer active");
  }

  // Update session data
  session.lastActivity = new Date();

  if (isFullscreenActive !== undefined) {
    session.isFullscreenActive = isFullscreenActive;
  }

  if (tabSwitchCount !== undefined) {
    session.tabSwitchCount = tabSwitchCount;
  }

  if (answers) {
    session.answers = new Map(Object.entries(answers));
  }

  await session.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Session updated successfully",
    data: session,
  });
});

// @desc    End exam session
// @route   PUT /api/sessions/:sessionId/end
// @access  Private (Student only)
export const endExamSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { status } = req.body; // 'completed', 'abandoned', 'terminated'

  const session = await ExamSession.findOne({ sessionId });

  if (!session) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Session not found");
  }

  // Verify ownership
  if (session.userId.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to end this session");
  }

  session.status = status || "completed";
  session.endTime = new Date();
  await session.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Session ended successfully",
    data: session,
  });
});

// @desc    Get session by ID
// @route   GET /api/sessions/:sessionId
// @access  Private
export const getSessionById = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await ExamSession.findOne({ sessionId }).populate(
    "userId",
    "name email"
  );

  if (!session) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Session not found");
  }

  // Check authorization
  const isOwner = session.userId._id.toString() === req.user._id.toString();
  const isTeacher = req.user.role === "teacher";

  if (!isOwner && !isTeacher) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to access this session");
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: session,
  });
});

// @desc    Get all sessions for an exam (Teacher only)
// @route   GET /api/sessions/exam/:examId
// @access  Private (Teacher only)
export const getSessionsByExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  // Verify exam exists and user owns it
  const exam = await Exam.findOne({ examId });

  if (!exam) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Exam not found");
  }

  if (exam.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to view sessions for this exam");
  }

  const sessions = await ExamSession.find({ examId })
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: sessions.length,
    data: sessions,
  });
});
