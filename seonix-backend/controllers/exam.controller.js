import asyncHandler from "express-async-handler";
import Exam from "../models/Exam.model.js";
import Question from "../models/Question.model.js";
import Result from "../models/Result.model.js";
import { HTTP_STATUS } from "../config/constants.js";

// @desc    Create new exam
// @route   POST /api/exams
// @access  Private (Teacher only)
export const createExam = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    duration,
    startDate,
    endDate,
    passingMarks,
    proctoringSettings,
    configuration,
  } = req.body;

  const exam = await Exam.create({
    title,
    description,
    duration,
    startDate,
    endDate,
    passingMarks: passingMarks || 0,
    totalQuestions: 0,
    totalMarks: 0,
    createdBy: req.user._id,
    proctoringSettings: proctoringSettings || {},
    configuration: configuration || {},
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Exam created successfully",
    data: exam,
  });
});

// @desc    Get all exams (for teacher: their exams, for student: active exams)
// @route   GET /api/exams
// @access  Private
// export const getAllExams = asyncHandler(async (req, res) => {
//   let query = {};

//   if (req.user.role === "teacher") {
//     // Teachers see their own exams
//     query.createdBy = req.user._id;
//   } else if (req.user.role === "student") {
//     // Students see only active exams within date range
//     const now = new Date();
//     query.isActive = true;
//     query.startDate = { $lte: now };
//     query.endDate = { $gte: now };
//   }

//   const exams = await Exam.find(query)
//     .populate("createdBy", "name email")
//     .sort({ createdAt: -1 });

//   res.status(HTTP_STATUS.OK).json({
//     success: true,
//     count: exams.length,
//     data: exams,
//   });
// });

// @desc    Get all exams (for teacher: their exams, for student: active exams)
// @route   GET /api/exams
// @access  Private
export const getAllExams = asyncHandler(async (req, res) => {
  let query = {};
  const now = new Date();

  if (req.user.role === "teacher") {
    // ✅ Teachers see their own exams (all of them)
    query.createdBy = req.user._id;
    
    // Fetch all exams
    const exams = await Exam.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    // ✅ Auto-update isActive based on date and process exams
    const processedExams = exams.map(exam => {
      const examObj = exam.toObject();
      
      // Auto-set isActive to false if expired
      if (now > new Date(examObj.endDate)) {
        examObj.isActive = false;
        
        // Update in database (non-blocking)
        Exam.findOneAndUpdate(
          { examId: examObj.examId },
          { isActive: false }
        ).catch(err => console.error('Error updating exam status:', err));
      }
      
      // Add computed status fields for frontend
      examObj.isLive = examObj.isActive && 
                       now >= new Date(examObj.startDate) && 
                       now <= new Date(examObj.endDate);
      examObj.isUpcoming = examObj.isActive && now < new Date(examObj.startDate);
      examObj.isExpired = now > new Date(examObj.endDate);
      
      return examObj;
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: processedExams.length,
      data: processedExams,
    });
    
  } else if (req.user.role === "student") {
    // ✅ Students see only live and upcoming exams (not expired)
    query.isActive = true;
    query.endDate = { $gte: now }; // Only exams that haven't ended yet
    
    const exams = await Exam.find(query)
      .populate("createdBy", "name email")
      .sort({ startDate: 1 });

    // Add computed status fields
    const processedExams = exams.map(exam => {
      const examObj = exam.toObject();
      examObj.isLive = now >= new Date(examObj.startDate) && 
                       now <= new Date(examObj.endDate);
      examObj.isUpcoming = now < new Date(examObj.startDate);
      examObj.isExpired = false; // Students won't see expired exams
      return examObj;
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: processedExams.length,
      data: processedExams,
    });
  }
});



// @desc    Get single exam by ID
// @route   GET /api/exams/:examId
// @access  Private
export const getExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ examId: req.params.examId }).populate(
    "createdBy",
    "name email"
  );

  if (!exam) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Exam not found");
  }

  // Check access permissions
  if (
    req.user.role === "teacher" &&
    exam.createdBy._id.toString() !== req.user._id.toString()
  ) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to access this exam");
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: exam,
  });
});

// @desc    Update exam
// @route   PUT /api/exams/:examId
// @access  Private (Teacher only - own exams)
export const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ examId: req.params.examId });

  if (!exam) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Exam not found");
  }

  // Check ownership
  if (exam.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to update this exam");
  }

  // Update fields
  const allowedUpdates = [
    "title",
    "description",
    "duration",
    "startDate",
    "endDate",
    "passingMarks",
    "isActive",
    "proctoringSettings",
    "configuration",
  ];

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      exam[field] = req.body[field];
    }
  });

  const updatedExam = await exam.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Exam updated successfully",
    data: updatedExam,
  });
});

// @desc    Delete exam
// @route   DELETE /api/exams/:examId
// @access  Private (Teacher only - own exams)
export const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ examId: req.params.examId });

  if (!exam) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Exam not found");
  }

  // Check ownership
  if (exam.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to delete this exam");
  }

  // Delete associated questions
  await Question.deleteMany({ examId: exam.examId });

  // Delete exam
  await exam.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Exam and associated questions deleted successfully",
  });
});

// @desc    Get exam statistics
// @route   GET /api/exams/:examId/statistics
// @access  Private (Teacher only)
export const getExamStatistics = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ examId: req.params.examId });

  if (!exam) {
    res.status(HTTP_STATUS.NOT_FOUND);
    throw new Error("Exam not found");
  }

  // Check ownership
  if (exam.createdBy.toString() !== req.user._id.toString()) {
    res.status(HTTP_STATUS.FORBIDDEN);
    throw new Error("Not authorized to view statistics");
  }

  // Get results for this exam
  const results = await Result.find({ examId: exam.examId }).populate(
    "userId",
    "name email"
  );

  const statistics = {
    totalAttempts: results.length,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    passedCount: 0,
    failedCount: 0,
    passRate: 0,
  };

  if (results.length > 0) {
    const scores = results.map((r) => r.percentage);
    statistics.averageScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length
    );
    statistics.highestScore = Math.max(...scores);
    statistics.lowestScore = Math.min(...scores);
    statistics.passedCount = results.filter(
      (r) => r.status === "passed"
    ).length;
    statistics.failedCount = results.filter(
      (r) => r.status === "failed"
    ).length;
    statistics.passRate = Math.round(
      (statistics.passedCount / results.length) * 100
    );
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      exam: {
        examId: exam.examId,
        title: exam.title,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
      },
      statistics,
      recentAttempts: results.slice(0, 10), // Last 10 attempts
    },
  });
});
