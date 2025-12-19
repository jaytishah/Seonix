import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Option text is required"],
    trim: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
});

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: String,
      required: [true, "Exam ID is required"],
      index: true,
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      minlength: [5, "Question must be at least 5 characters"],
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: function (options) {
          return options.length >= 2 && options.length <= 6;
        },
        message: "Question must have between 2 and 6 options",
      },
    },
    marks: {
      type: Number,
      required: [true, "Marks are required"],
      min: [1, "Marks must be at least 1"],
      default: 1,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    explanation: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
questionSchema.index({ examId: 1, createdAt: 1 });

// Validation: At least one correct answer
questionSchema.pre("save", function (next) {
  const hasCorrectAnswer = this.options.some((option) => option.isCorrect);
  if (!hasCorrectAnswer) {
    return next(new Error("At least one option must be marked as correct"));
  }
  next();
});

const Question = mongoose.model("Question", questionSchema);

export default Question;
