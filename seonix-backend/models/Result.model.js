import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    examId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Answer tracking
    answers: {
      type: Map,
      of: String,
      required: true,
    },
    // Scoring
    totalQuestions: {
      type: Number,
      required: true,
    },
    attemptedQuestions: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    wrongAnswers: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    obtainedMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    // Status
    status: {
      type: String,
      enum: ["passed", "failed", "under_review"],
      default: "under_review",
    },
    // Time tracking
    timeTaken: {
      type: Number, // in minutes
      default: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    // Visibility
    showToStudent: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    // Feedback
    feedback: {
      type: String,
      trim: true,
    },
    // Grading
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    gradedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
resultSchema.index({ examId: 1, userId: 1 });
resultSchema.index({ userId: 1, createdAt: -1 });

// Pre-save hook to calculate statistics
resultSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("answers")) {
    this.attemptedQuestions = this.answers.size;
    this.wrongAnswers = this.attemptedQuestions - this.correctAnswers;

    if (this.totalMarks > 0) {
      this.percentage = Math.round(
        (this.obtainedMarks / this.totalMarks) * 100
      );
    }
  }
  next();
});

const Result = mongoose.model("Result", resultSchema);

export default Result;
