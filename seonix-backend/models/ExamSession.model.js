import mongoose from "mongoose";

const examSessionSchema = new mongoose.Schema(
  {
    examId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned", "terminated"],
      default: "active",
    },
    // Session monitoring
    isFullscreenActive: {
      type: Boolean,
      default: false,
    },
    tabSwitchCount: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    // Answers tracking
    answers: {
      type: Map,
      of: String,
      default: new Map(),
    },
    // Browser & System Info
    browserInfo: {
      userAgent: String,
      browser: String,
      os: String,
      device: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique user-exam sessions
examSessionSchema.index({ examId: 1, userId: 1 });

// Method to check if session is expired
examSessionSchema.methods.isExpired = function (examDuration) {
  const now = new Date();
  const sessionDuration = (now - this.startTime) / (1000 * 60); // in minutes
  return sessionDuration > examDuration;
};

const ExamSession = mongoose.model("ExamSession", examSessionSchema);

export default ExamSession;
