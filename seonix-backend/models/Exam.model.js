import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const examSchema = new mongoose.Schema(
  {
    examId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Exam title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [5, "Duration must be at least 5 minutes"],
      max: [300, "Duration cannot exceed 300 minutes"],
    },
    totalQuestions: {
    type: Number,
    required: true,
    default: 0,  // ✅ Allow 0 questions initially
    min: [0, 'Total questions cannot be negative'],
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    passingMarks: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Proctoring Settings  
    proctoringSettings: {
      enableFullscreen: {
        type: Boolean,
        default: true,
      },
      enableTabSwitch: {
        type: Boolean,
        default: true,
      },
      enableWebcam: {
        type: Boolean,
        default: true,
      },
      maxTabSwitches: {
        type: Number,
        default: 3,
      },
      strictMode: {
        type: Boolean,
        default: false,
      },
    },
    // Exam Configuration
    configuration: {
      shuffleQuestions: {
        type: Boolean,
        default: true,
      },
      shuffleOptions: {
        type: Boolean,
        default: true,
      },
      showResultImmediately: {
        type: Boolean,
        default: false,
      },
      allowReview: {
        type: Boolean,
        default: false,
      },
    },
    // Statistics
    statistics: {
      totalAttempts: {
        type: Number,
        default: 0,
      },
      totalViolations: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
examSchema.index({ createdBy: 1, createdAt: -1 });
examSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Virtual for checking if exam is live
examSchema.virtual("isLive").get(function () {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Virtual for checking if exam is upcoming
examSchema.virtual("isUpcoming").get(function () {
  const now = new Date();
  return this.isActive && now < this.startDate;
});

// Virtual for checking if exam is expired
examSchema.virtual("isExpired").get(function () {
  const now = new Date();
  return now > this.endDate;
});

const Exam = mongoose.model("Exam", examSchema);

export default Exam;
