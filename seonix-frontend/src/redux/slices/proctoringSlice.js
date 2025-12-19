import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import proctoringService from "@services/proctoring.service";
import { getErrorMessage } from "@utils/helpers";

const initialState = {
  currentLog: null,
  violations: [],
  isMonitoring: false,
  webcamActive: false,
  fullscreenActive: false,
  tabSwitchCount: 0,
  riskScore: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const createOrUpdateLog = createAsyncThunk(
  "proctoring/createOrUpdateLog",
  async ({ examId, sessionId }, { rejectWithValue }) => {
    try {
      const response = await proctoringService.createOrUpdateLog(
        examId,
        sessionId
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const logViolation = createAsyncThunk(
  "proctoring/logViolation",
  async (violationData, { rejectWithValue }) => {
    try {
      const response = await proctoringService.logViolation(violationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchLogBySession = createAsyncThunk(
  "proctoring/fetchLogBySession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await proctoringService.getLogBySession(sessionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// Slice
const proctoringSlice = createSlice({
  name: "proctoring",
  initialState,
  reducers: {
    startMonitoring: (state) => {
      state.isMonitoring = true;
    },
    stopMonitoring: (state) => {
      state.isMonitoring = false;
    },
    setWebcamActive: (state, action) => {
      state.webcamActive = action.payload;
    },
    setFullscreenActive: (state, action) => {
      state.fullscreenActive = action.payload;
    },
    incrementTabSwitch: (state) => {
      state.tabSwitchCount += 1;
    },
    addLocalViolation: (state, action) => {
      state.violations.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearViolations: (state) => {
      state.violations = [];
    },
    resetProctoringState: (state) => {
      state.currentLog = null;
      state.violations = [];
      state.isMonitoring = false;
      state.webcamActive = false;
      state.fullscreenActive = false;
      state.tabSwitchCount = 0;
      state.riskScore = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create or Update Log
      .addCase(createOrUpdateLog.fulfilled, (state, action) => {
        state.currentLog = action.payload;
      })

      // Log Violation
      .addCase(logViolation.fulfilled, (state, action) => {
        if (action.payload.riskScore !== undefined) {
          state.riskScore = action.payload.riskScore;
        }
      })

      // Fetch Log By Session
      .addCase(fetchLogBySession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLogBySession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLog = action.payload;
        state.riskScore = action.payload.riskScore || 0;
      })
      .addCase(fetchLogBySession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  startMonitoring,
  stopMonitoring,
  setWebcamActive,
  setFullscreenActive,
  incrementTabSwitch,
  addLocalViolation,
  clearViolations,
  resetProctoringState,
} = proctoringSlice.actions;

export default proctoringSlice.reducer;
    