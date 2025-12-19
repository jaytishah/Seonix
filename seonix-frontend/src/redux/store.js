import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import examReducer from "./slices/examSlice";
import proctoringReducer from "./slices/proctoringSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    exam: examReducer,
    proctoring: proctoringReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["exam/setCurrentQuestion"],
        // Ignore these paths in the state
        ignoredPaths: ["exam.currentQuestion"],
      },
    }),
  devTools: import.meta.env.MODE !== "production",
});

export default store;
