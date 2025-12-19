import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import examService from "@services/exam.service";
import { getErrorMessage } from "@utils/helpers";

const initialState = {
  exams: [],
  currentExam: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  isLoading: false,
  error: null,
  statistics: null,
};

// Async thunks
export const fetchExams = createAsyncThunk(
  "exam/fetchExams",
  async (_, { rejectWithValue }) => {
    try {
      const response = await examService.getAllExams();
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchExamById = createAsyncThunk(
  "exam/fetchExamById",
  async (examId, { rejectWithValue }) => {
    try {
      const response = await examService.getExamById(examId);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchQuestions = createAsyncThunk(
  "exam/fetchQuestions",
  async ({ examId, shuffle }, { rejectWithValue }) => {
    try {
      const response = await examService.getQuestionsByExam(examId, shuffle);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createExam = createAsyncThunk(
  "exam/createExam",
  async (examData, { rejectWithValue }) => {
    try {
      const response = await examService.createExam(examData);
      console.log(response);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateExam = createAsyncThunk(
  "exam/updateExam",
  async ({ examId, examData }, { rejectWithValue }) => {
    try {
      const response = await examService.updateExam(examId, examData);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteExam = createAsyncThunk(
  "exam/deleteExam",
  async (examId, { rejectWithValue }) => {
    try {
      await examService.deleteExam(examId);
      return examId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchExamStatistics = createAsyncThunk(
  "exam/fetchStatistics",
  async (examId, { rejectWithValue }) => {
    try {
      const response = await examService.getExamStatistics(examId);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Slice
const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    setCurrentExam: (state, action) => {
      state.currentExam = action.payload;
    },
    setQuestions: (state, action) => {
      state.questions = action.payload;
    },
    setCurrentQuestionIndex: (state, action) => {
      state.currentQuestionIndex = action.payload;
    },
    setAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
    },
    clearAnswers: (state) => {
      state.answers = {};
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    goToQuestion: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.questions.length) {
        state.currentQuestionIndex = index;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetExamState: (state) => {
      state.currentExam = null;
      state.questions = [];
      state.currentQuestionIndex = 0;
      state.answers = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Exams
      .addCase(fetchExams.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exams = action.payload;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Exam By ID
      .addCase(fetchExamById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExamById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExam = action.payload;
      })
      .addCase(fetchExamById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Questions
      .addCase(fetchQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questions = action.payload;
        state.currentQuestionIndex = 0;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create Exam
      .addCase(createExam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exams.unshift(action.payload);
      })
      .addCase(createExam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Exam
      .addCase(updateExam.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.exams.findIndex(
          (e) => e.examId === action.payload.examId
        );
        if (index !== -1) {
          state.exams[index] = action.payload;
        }
        if (state.currentExam?.examId === action.payload.examId) {
          state.currentExam = action.payload;
        }
      })
      .addCase(updateExam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Exam
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.exams = state.exams.filter((e) => e.examId !== action.payload);
      })

      // Fetch Statistics
      .addCase(fetchExamStatistics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchExamStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchExamStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentExam,
  setQuestions,
  setCurrentQuestionIndex,
  setAnswer,
  clearAnswers,
  nextQuestion,
  previousQuestion,
  goToQuestion,
  clearError,
  resetExamState,
} = examSlice.actions;

export default examSlice.reducer;
