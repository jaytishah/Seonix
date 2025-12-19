import mongoose from "mongoose";

const violationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "no_face",
      "multiple_faces",
      "cell_phone",
      "prohibited_object",
      "tab_switch",
      "fullscreen_exit",
      "copy_paste",
      "suspicious_activity",
    ],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
  screenshot: {
    type: String, // Base64 or URL
  },
  description: {
    type: String,
  },
});

const proctoringLogSchema = new mongoose.Schema(
  {
    examId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
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
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    // Violation Counts
    violations: [violationSchema],
    violationSummary: {
      noFaceCount: { type: Number, default: 0 },
      multipleFaceCount: { type: Number, default: 0 },
      cellPhoneCount: { type: Number, default: 0 },
      prohibitedObjectCount: { type: Number, default: 0 },
      tabSwitchCount: { type: Number, default: 0 },
      fullscreenExitCount: { type: Number, default: 0 },
      copyPasteCount: { type: Number, default: 0 },
      suspiciousActivityCount: { type: Number, default: 0 },
    },
    // Overall Risk Score (0-100)
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Flag for review
    flaggedForReview: {
      type: Boolean,
      default: false,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
proctoringLogSchema.index({ examId: 1, userId: 1 });
proctoringLogSchema.index({ flaggedForReview: 1 });

// Method to calculate risk score
proctoringLogSchema.methods.calculateRiskScore = function () {
  const weights = {
    noFaceCount: 8,
    multipleFaceCount: 10,
    cellPhoneCount: 15,
    prohibitedObjectCount: 12,
    tabSwitchCount: 5,
    fullscreenExitCount: 6,
    copyPasteCount: 7,
    suspiciousActivityCount: 10,
  };

  let score = 0;
  for (const [key, value] of Object.entries(this.violationSummary)) {
    score += value * (weights[key] || 5);
  }

  this.riskScore = Math.min(score, 100);

  // Auto-flag if risk score is high
  if (this.riskScore >= 50) {
    this.flaggedForReview = true;
  }

  return this.riskScore;
};

const ProctoringLog = mongoose.model("ProctoringLog", proctoringLogSchema);

export default ProctoringLog;
